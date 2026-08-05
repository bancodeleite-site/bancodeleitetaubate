import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase URL or Anon Key is missing. Check your .env.local file.");
}

// Cliente Público: usado pelo frontend para ler dados (respeita RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente Administrativo: usado EXCLUSIVAMENTE pelo backend/API routes para ignorar RLS
// Jamais importe isso em componentes do lado do cliente ('use client')
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : supabase; // Fallback temporário caso a chave não esteja presente (vai falhar no RLS se tentar gravar)
