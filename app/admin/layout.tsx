"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && pathname !== '/transparencia') {
        router.push('/transparencia');
      } else {
        setAuthenticated(!!session);
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && pathname !== '/transparencia') {
        router.push('/transparencia');
      }
      setAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#2B6B43]">
        <p className="font-semibold text-lg">Carregando painel...</p>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada (vai redirecionar)
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {authenticated && (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-[#2B6B43]">Painel Administrativo BLH</h1>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            Sair do sistema
          </button>
        </header>
      )}
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
