import { google } from 'googleapis';
import { Readable } from 'stream';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

if (REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
}

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export async function uploadFileToDrive(fileName: string, mimeType: string, fileBuffer: Buffer) {
  if (!FOLDER_ID) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured");

  const stream = Readable.from(fileBuffer);

  const fileMetadata = {
    name: fileName,
    parents: [FOLDER_ID]
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    const fileId = response.data.id;

    if (!fileId) throw new Error("Falha ao obter ID do arquivo no Google Drive");

    // Tornar o arquivo público (Qualquer pessoa com o link - Leitor)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      id: fileId,
      url: response.data.webViewLink,
    };
  } catch (error) {
    console.error("Erro no upload para o Drive:", error);
    throw error;
  }
}

export async function deleteFileFromDrive(fileId: string) {
  try {
    await drive.files.delete({
      fileId: fileId,
    });
    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivo do Drive:", error);
    throw error;
  }
}
