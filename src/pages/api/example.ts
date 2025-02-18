import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    console.log('API: Starting to fetch posts...');

    // 現在のユーザーを取得
    const { userId: clerkId } = await auth();
    console.log('API: Current user clerkId:', clerkId);

    let currentUserId: number | null = null;
    if (clerkId) {
      try {
        const currentUser = await prisma.user.findUnique({
          where: { clerkId },
          select: { id: true }
        });
        console.log('API: Found current user:', currentUser);
        currentUserId = currentUser?.id ?? null;
      } catch (userError) {
        console.error('API: Error finding current user:', userError);
      }
    }

    // Prismaクエリの構築
    const queryOptions = {
      where: currentUserId ? {
        likes: {
          none: {
            userId: currentUserId
          }
        }
      } : undefined,
      orderBy: {
        createdAt: Prisma.SortOrder.desc
      },
      include: {
        user: true,
        likes: true
      }
    };

    console.log('API: Executing query with options:', JSON.stringify(queryOptions, null, 2));

    const posts = await prisma.post.findMany(queryOptions);
    console.log('API: Found posts count:', posts.length);

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.user.clerkId,
      date: post.createdAt.toISOString(),
      username: post.user.username,
      avatarUrl: post.user.avatarUrl,
      imageUrl: post.user.imageUrl,
      statusMessage: post.user.statusMessage
    }));

    console.log('API: Successfully formatted posts. Count:', formattedPosts.length);

    return res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });

    return res.status(500).json({ 
      error: '投稿の取得に失敗しました',
      details: error instanceof Error ? error.message : '不明なエラー',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
} 