import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createResumableUploadSession } from '@/lib/google-drive';

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

    // 2. Extrair informações do arquivo
    const body = await req.json();
    const { fileName, mimeType } = body;

    if (!fileName || !mimeType) {
      return NextResponse.json({ error: 'Faltando nome ou mimetype' }, { status: 400 });
    }

    // 3. Criar Sessão no Google Drive
    const origin = req.headers.get('Origin') || req.nextUrl.origin || '*';
    const uploadUrl = await createResumableUploadSession(fileName, mimeType, origin);

    return NextResponse.json({ success: true, uploadUrl });
  } catch (error: any) {
    console.error("Erro na rota init upload:", error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
