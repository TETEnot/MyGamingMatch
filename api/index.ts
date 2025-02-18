import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { verifyClerkToken } from './utils'; // ClerkのJWTを検証するユーティリティ関数

const prisma = new PrismaClient();
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

  try {
    // ここでファイルをストレージサービスにアップロードするロジックを実装
    // 例: await uploadToStorage(file, fileName);
    return c.json({ url: fileUrl });
  } catch (error) {
    console.error('アップロードエラー:', error);
    return c.json({ error: 'ファイルのアップロードに失敗しました' }, 500);
  }
});

app.get('/api/posts', async (c) => {
  try {
    const posts = [
      {
        id: 1,
        name: 'アレックス',
        game: 'ゲームA',
        description: '一緒にプレイしませんか？',
        date: '2023-10-01',
      },
    ];
    return c.json(posts);
  } catch (error) {
    console.error('データ取得エラー:', error);
    return c.json({ error: 'データの取得に失敗しました' }, 500);
  }
});

app.post('/api/profile', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: '認証トークンがありません' }, 401);
  }

  const clerkUser = await verifyClerkToken(token);
  if (!clerkUser) {
    return c.json({ error: '無効なトークン' }, 401);
  }

  const { id, email_addresses, first_name, last_name, profile_image_url } = clerkUser;
  const email = email_addresses[0]?.email_address;
  const username = `${first_name} ${last_name}`.trim() || 'ゲスト';

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId: id },
      update: {
        username,
        email,
        avatarUrl: profile_image_url,
      },
      create: {
        clerkUserId: id,
        username,
        email,
        avatarUrl: profile_image_url,
      },
    });

    return c.json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    return c.json({ error: 'Failed to save user' }, 500);
  }
});

app.post('/api/posts', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: '認証トークンがありません' }, 401);
  }

  const clerkUser = await verifyClerkToken(token);
  if (!clerkUser) {
    return c.json({ error: '無効なトークン' }, 401);
  }

  const { content, title } = await c.req.json();
  const user = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  try {
    const post = await prisma.post.create({
      data: {
        content,
        title,
        username: user.username,
        userId: user.id,
      },
    });

    return c.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

export default app;