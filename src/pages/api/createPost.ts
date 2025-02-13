import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { content, clerkUserId } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const post = await prisma.post.create({
        data: {
          content,
          username: user.username,
          userId: user.id,
        },
      });

      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 