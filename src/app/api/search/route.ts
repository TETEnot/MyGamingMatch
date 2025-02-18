import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const followedOnly = searchParams.get('followedOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;

    const { userId: clerkId } = await auth();
    let currentUserId: number | undefined;

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      });
      currentUserId = user?.id;
    }

    // 検索条件の構築
    const where: any = {
      AND: [
        {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        }
      ]
    };

    // 日付フィルター
    if (startDate) {
      where.AND.push({ createdAt: { gte: new Date(startDate) } });
    }
    if (endDate) {
      where.AND.push({ createdAt: { lte: new Date(endDate) } });
    }

    // フォロー中のユーザーのみ
    if (followedOnly && currentUserId) {
      const following = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true }
      });
      const followingIds = following.map(f => f.followingId);
      where.AND.push({ userId: { in: followingIds } });
    }

    // 検索実行
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              clerkId: true,
              username: true,
              avatarUrl: true,
              imageUrl: true,
              statusMessage: true
            }
          },
          likes: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    // レスポンスの整形
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.user.clerkId,
      date: post.createdAt.toISOString(),
      username: post.user.username,
      avatarUrl: post.user.avatarUrl,
      imageUrl: post.user.imageUrl,
      statusMessage: post.user.statusMessage,
      likeCount: post.likes.length,
      isLiked: currentUserId ? post.likes.some(like => like.userId === currentUserId) : false
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: '検索中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
} 