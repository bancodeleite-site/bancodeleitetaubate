import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  // Protege a rota com um token secreto
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');

  if (secret !== process.env.KEEPALIVE_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Chamada mínima: lista 1 arquivo só para "usar" o token
    await drive.files.list({ pageSize: 1, fields: 'files(id)' });

    console.log(`[Keepalive] Google Drive token renovado com sucesso em ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Token renovado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Keepalive] Erro ao renovar token:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
