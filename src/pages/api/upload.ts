import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // アップロードディレクトリが存在しない場合は作成
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir: UPLOADS_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'ファイルが見つかりません' });
    }

    // ファイル名を生成
    const fileExt = path.extname(file.originalFilename || '');
    const fileName = `${nanoid()}${fileExt}`;
    const newPath = path.join(UPLOADS_DIR, fileName);

    // ファイルを移動
    fs.renameSync(file.filepath, newPath);

    // 開発環境用のURL
    const fileUrl = `/uploads/${fileName}`;

    res.status(200).json({ 
      url: fileUrl,
      success: true 
    });
  } catch (error) {
    console.error('アップロードエラー:', error);
    res.status(500).json({ 
      error: 'ファイルのアップロードに失敗しました',
      details: error instanceof Error ? error.message : '不明なエラー'
    });
  }
}
