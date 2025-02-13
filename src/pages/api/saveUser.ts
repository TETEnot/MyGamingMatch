import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { clerkId, username, imageUrl, statusMessage } = req.body;

    console.log('Received data:', req.body); // デバッグ用ログ

    try {
      const user = await prisma.user.upsert({
        where: { clerkId },
        update: {
          username,
          imageUrl,
          statusMessage,
        },
        create: {
          clerkId,
          username,
          imageUrl,
          statusMessage,
        },
      });

      console.log('User saved:', user); // デバッグ用ログ
      res.status(200).json(user);
    } catch (error) {
      console.error('Error saving user:', error);
      res.status(500).json({ error: 'Failed to save user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 