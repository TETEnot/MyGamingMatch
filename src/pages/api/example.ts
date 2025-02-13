import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Post {
  name: string;
  game: string;
  description: string;
  date: string;
  username: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const posts = await prisma.post.findMany();
      res.status(200).json(posts);
    } catch (error) {
      console.error('データ取得エラー:', error);
      res.status(500).json({ error: 'データの取得に失敗しました' });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('Received POST data:', req.body);
      const newPost: Post = req.body;
      const post = await prisma.post.create({ data: newPost });
      res.status(201).json(post);
    } catch (error) {
      console.error('投稿エラー:', error);
      res.status(500).json({ 
        error: '投稿に失敗しました', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 