import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive } from '@/lib/google-drive';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
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

    // 2. Extrair dados do FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const id_projeto = formData.get('id_projeto') as string;
    const tipo = formData.get('tipo') as string;
    const nome_arquivo = formData.get('nome_arquivo') as string;
    const anoStr = formData.get('ano') as string;
    const mesStr = formData.get('mes') as string;

    if (!file || !id_projeto || !tipo || !nome_arquivo) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const ano = anoStr ? parseInt(anoStr) : null;
    const mes = mesStr ? parseInt(mesStr) : null;

    // 3. Converter o arquivo para Buffer para enviar ao Drive
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload para o Google Drive
    const driveResult = await uploadFileToDrive(file.name, file.type, buffer);

    // 5. Salvar metadados no Supabase
    const { data, error: dbError } = await supabaseAdmin
      .from('documentos')
      .insert([
        {
          id_projeto,
          tipo,
          drive_id: driveResult.id,
          drive_url: driveResult.url,
          ano,
          mes,
          nome_arquivo
        }
      ])
      .select()
      .single();

    if (dbError) {
      // Se falhar no banco, tenta deletar do drive para não deixar lixo
      try {
        const { deleteFileFromDrive } = await import('@/lib/google-drive');
        await deleteFileFromDrive(driveResult.id);
      } catch (e) {
        console.error("Falha ao reverter arquivo no Drive após erro no banco", e);
      }
      throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
    }

    return NextResponse.json({ success: true, documento: data });
  } catch (error: any) {
    console.error("Erro na rota de upload:", error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
