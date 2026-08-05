import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user;
}

// PATCH: Renomear nome de exibição de um documento
export async function PATCH(req: NextRequest) {
  try {
    const user = await checkAuth(req);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id, nome_arquivo } = await req.json();
    if (!id || !nome_arquivo) return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('documentos')
      .update({ nome_arquivo })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
