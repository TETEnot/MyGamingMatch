import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const { userId } = auth();
    let currentUser = null;

    if (userId) {
      currentUser = await prisma.user.findUnique({
        where: { clerkId: userId }
      });
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    let followedUserIds: number[] = [];
    if (currentUser) {
      const following = await prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true }
      });
      followedUserIds = following.map((follow: { followingId: number }) => follow.followingId);
    }

    const includeOptions = {
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
      likes: true,
    } satisfies Prisma.PostInclude;

    // フォロー中のユーザーの最近の投稿を取得
    const followedUserPosts = currentUser ? await prisma.post.findMany({
      where: {
        userId: { in: followedUserIds },
        createdAt: { gte: threeDaysAgo }
      },
      include: includeOptions,
      orderBy: { createdAt: 'desc' }
    }) : [];

    // その他のユーザーの投稿を取得
    const otherPosts = await prisma.post.findMany({
      where: {
        userId: { notIn: [...followedUserIds, currentUser?.id || -1] },
        NOT: currentUser ? {
          bads: {
            some: { userId: currentUser.id }
          }
        } : undefined
      },
      include: includeOptions,
      orderBy: { createdAt: 'desc' }
    });

    // 投稿を結合して返す
    const posts = [...followedUserPosts, ...otherPosts].map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.user.clerkId,
      date: post.createdAt.toISOString(),
      username: post.user.username,
      avatarUrl: post.user.avatarUrl,
      imageUrl: post.user.imageUrl,
      statusMessage: post.user.statusMessage,
      likeCount: post.likes.length
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { game, description } = await req.json();

    if (!game || !description) {
      return NextResponse.json(
        { error: 'ゲーム名と説明文は必須です' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title: game,
        content: description,
        userId: user.id,
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        userId: post.user.clerkId,
        createdAt: post.createdAt,
        username: post.user.username,
        avatarUrl: post.user.avatarUrl,
        imageUrl: post.user.imageUrl,
        statusMessage: post.user.statusMessage
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { 
        error: '投稿の作成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}