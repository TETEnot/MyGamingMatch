import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { game, description, clerkUserId } = req.body;

  if (!game || !description || !clerkUserId) {
    return res.status(400).json({
      error: '必須フィールドが不足しています',
      details: `Required: ${!game ? 'game, ' : ''}${!description ? 'description, ' : ''}${!clerkUserId ? 'clerkUserId' : ''}`
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        imageUrl: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    console.log('Creating post with user data:', user);

    const post = await prisma.post.create({
      data: {
        title: game,
        content: description,
        username: user.username,
        userId: user.id,
        userAvatarUrl: user.avatarUrl || user.imageUrl || null,
      },
      include: {
        user: true
      }
    });

    console.log('Post created successfully:', post);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      error: '投稿の作成に失敗しました',
      details: error instanceof Error ? error.message : '不明なエラー'
    });
  } finally {
    await prisma.$disconnect();
  }
} 