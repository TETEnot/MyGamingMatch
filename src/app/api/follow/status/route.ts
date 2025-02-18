import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json(
        { error: '対象ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    const targetUser = await prisma.user.findUnique({
      where: { clerkId: targetUserId }
    });

    if (!currentUser || !targetUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const follow = await prisma.follow.findFirst({
      where: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Follow status error:', error);
    return NextResponse.json(
      { 
        error: 'フォロー状態の確認に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
} 