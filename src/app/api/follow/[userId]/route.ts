import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!params.userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが指定されていません' },
        { status: 400 }
      );
    }

    if (!type || !['followers', 'following'].includes(type)) {
      return NextResponse.json(
        { error: '無効なタイプが指定されました' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: params.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const users = await prisma.user.findMany({
      where: type === 'followers' ? {
        following: {
          some: {
            followingId: user.id
          }
        }
      } : {
        followers: {
          some: {
            followerId: user.id
          }
        }
      },
      select: {
        id: true,
        clerkId: true,
        username: true,
        avatarUrl: true,
        imageUrl: true,
        statusMessage: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching follow list:', error);
    return NextResponse.json(
      { 
        error: 'フォローリストの取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
} 