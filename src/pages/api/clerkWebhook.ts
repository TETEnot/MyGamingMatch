import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // CORSを許可
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { data } = req.body;
      if (!data) {
        throw new Error('Payload is missing');
      }

      const { id, email_addresses, first_name, last_name, profile_image_url } = data;

      if (!email_addresses || email_addresses.length === 0) {
        return res.status(400).json({ error: 'Email addresses are missing' });
      }

      const email = email_addresses[0]?.email_address;
      const username = `${first_name} ${last_name || ''}`.trim() || 'ゲスト';

      console.log('Webhook received data:', req.body); // デバッグ用ログ

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

      console.log('User created or updated in database:', user); // デバッグ用ログ
      res.status(200).json(user);
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function main() {
  const user = await prisma.user.create({
    data: {
      clerkUserId: 'example-id',
      username: 'example-username',
      email: 'example@example.com',
      avatarUrl: 'http://example.com/avatar.png',
    },
  });
  console.log(user);
}

main()
  .catch(e => {
    console.error('Error inserting user:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 