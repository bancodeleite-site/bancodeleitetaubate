import { NextRequest, NextResponse } from 'next/server';
import { deleteFileFromDrive } from '@/lib/google-drive';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    // 1. Verificar Autenticação (Bearer Token)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    }

    // 2. Extrair dados da requisição
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do documento não fornecido' }, { status: 400 });
    }

    // 3. Buscar os metadados do documento no Supabase para pegar o drive_id
    const { data: documento, error: fetchError } = await supabaseAdmin
      .from('documentos')
      .select('drive_id')
      .eq('id', id)
      .single();

    if (fetchError || !documento) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    // 4. Excluir do Google Drive primeiro
    await deleteFileFromDrive(documento.drive_id);

    // 5. Excluir do Supabase
    const { error: deleteError } = await supabaseAdmin
      .from('documentos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      // Aqui teríamos um arquivo órfão excluído no Drive mas não no banco
      // idealmente um job ou webhook resolveria a inconsistência,
      // mas na prática a exclusão no Supabase raramente falha se o select funcionou.
      throw new Error(`Erro ao excluir no banco: ${deleteError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro na rota de exclusão:", error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
