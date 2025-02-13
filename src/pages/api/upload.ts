import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import AWS from 'aws-sdk';

export const config = {
  api: {
    bodyParser: false,
  },
};

type FormidableFields = Record<string, string | string[]>;
type FormidableFiles = Record<string, File | File[]>;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();

  form.parse(req, (err: Error | null, fields: FormidableFields, files: FormidableFiles) => {
    if (err) {
      console.error('Formidable error:', err);
      res.status(500).json({ error: '画像のアップロードに失敗しました' });
      return;
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      res.status(400).json({ error: 'ファイルが見つかりません' });
      return;
    }

    const fileContent = fs.readFileSync(file.filepath);
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
      console.error('Bucket name is not defined');
      res.status(500).json({ error: 'バケット名が定義されていません' });
      return;
    }

    const params = {
      Bucket: bucketName,
      Key: file.newFilename,
      Body: fileContent,
      ContentType: file.type || 'image/jpeg',
    };

    s3.upload(params, (s3Err: Error | null, data: AWS.S3.ManagedUpload.SendData) => {
      if (s3Err) {
        console.error('S3 upload error:', s3Err);
        res.status(500).json({ error: 'ファイルのアップロードに失敗しました' });
        return;
      }
      res.status(200).json({ url: data.Location });
    });
  });
}
