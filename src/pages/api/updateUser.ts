import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { clerkUserId, username, email, avatarUrl } = req.body;

    console.log('Received data:', { clerkUserId, username, email, avatarUrl });

    try {
      const user = await prisma.user.update({
        where: { clerkUserId },
        data: {
          username,
          email,
          avatarUrl,
        },
      });

      console.log('User updated in database:', user);
      console.log('Sending data:', { clerkUserId: user.clerkUserId, username, email, avatarUrl });
      res.status(200).json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 