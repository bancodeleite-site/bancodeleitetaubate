import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { deleteFileFromDrive } from '@/lib/google-drive';

// Helper de autenticação
async function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await checkAuth(req);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { error } = await supabaseAdmin.from('projetos').insert([body]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await checkAuth(req);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;

    const { error } = await supabaseAdmin.from('projetos').update(updates).eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await checkAuth(req);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

    // 1. Buscar documentos do projeto para excluir no Drive
    const { data: documentos } = await supabaseAdmin.from('documentos').select('drive_id').eq('id_projeto', id);
    
    // 2. Excluir os arquivos no Google Drive
    if (documentos && documentos.length > 0) {
      for (const doc of documentos) {
        if (doc.drive_id) {
          try {
            await deleteFileFromDrive(doc.drive_id);
          } catch (e) {
            console.error(`Falha ao excluir o arquivo ${doc.drive_id} do Drive, ignorando...`, e);
          }
        }
      }
    }

    // 3. Excluir o projeto do Supabase (documentos serão apagados por CASCADE)
    const { error } = await supabaseAdmin.from('projetos').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
