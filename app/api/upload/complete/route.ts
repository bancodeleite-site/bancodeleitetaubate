import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { finalizeUploadAndGetLink } from '@/lib/google-drive';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    }

    // 2. Extrair dados
    const body = await req.json();
    const { fileId, id_projeto, tipo, ano, mes, nome_arquivo } = body;

    if (!fileId || !id_projeto || !tipo || !nome_arquivo) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // 3. Finalizar upload no Drive (tornar público e pegar link)
    const driveUrl = await finalizeUploadAndGetLink(fileId);

    // 4. Salvar no Supabase
    const { error: dbError } = await supabaseAdmin.from('documentos').insert({
      id_projeto,
      tipo,
      drive_id: fileId,
      drive_url: driveUrl,
      ano: ano ? parseInt(ano, 10) : null,
      mes: mes ? parseInt(mes, 10) : null,
      nome_arquivo,
    });

    if (dbError) {
      console.error("Erro ao salvar no banco:", dbError);
      throw new Error("Erro ao salvar o registro no banco de dados");
    }

    return NextResponse.json({ success: true, url: driveUrl, drive_id: fileId });
  } catch (error: any) {
    console.error("Erro na rota complete upload:", error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
