import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, email_addresses, first_name, last_name, profile_image_url } = req.body.data;

    const email = email_addresses[0]?.email_address;
    const username = `${first_name} ${last_name}`.trim() || 'ゲスト';

    console.log('Webhook received data:', req.body); // デバッグ用ログ

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

      console.log('User created in database:', user); // デバッグ用ログ
      res.status(200).json(user);
    } catch (error) {
      console.error('Error saving user from webhook:', error);
      res.status(500).json({ error: 'Failed to save user from webhook' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 