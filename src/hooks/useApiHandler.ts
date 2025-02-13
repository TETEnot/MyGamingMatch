import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello, Hono!'));

app.post('/auth', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: '認証トークンがありません' }, 401);
  }
  // トークンの検証ロジック
  return c.json({ message: '認証成功' });
});

export default app;