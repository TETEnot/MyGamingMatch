import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS設定
app.use('*', cors({
  origin: '*', // 必要に応じて適切なオリジンを設定
}));

app.post('/api/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  const fileName = `${nanoid()}.${file.type.split('/')[1]}`;
  const fileUrl = `https://your-storage-service.com/${fileName}`;

  // ここでファイルをストレージサービスにアップロードするロジックを実装
  // 例: await uploadToStorage(file, fileName);

  return c.json({ url: fileUrl });
});

export default app;