import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get('userId');
    
    let where = {};
    if (userIdParam) {
      where = {
        user: {
          clerkId: userIdParam
        }
      };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        createdAt: Prisma.SortOrder.desc
      },
      include: {
        user: true,
        likes: true
      }
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      userId: post.user.clerkId,
      username: post.user.username,
      avatarUrl: post.user.avatarUrl,
      imageUrl: post.user.imageUrl,
      statusMessage: post.user.statusMessage,
      likeCount: post.likeCount,
      likes: post.likes
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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
  } finally {
    await prisma.$disconnect();
  }
}