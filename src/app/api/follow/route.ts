import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { targetUserId } = await request.json();
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

    // 自分自身をフォローすることはできない
    if (currentUser.id === targetUser.id) {
      return NextResponse.json(
        { error: '自分自身をフォローすることはできません' },
        { status: 400 }
      );
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    if (existingFollow) {
      // アンフォロー
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return NextResponse.json({ isFollowing: false });
    } else {
      // フォロー
      const follow = await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      });

      // 通知の作成
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          type: 'FOLLOW',
          actorId: currentUser.id,
        },
      });

      // Pusher通知の送信
      try {
        const notificationData = {
          type: 'FOLLOW',
          actorName: currentUser.username || 'ゲスト',
          actorId: currentUser.clerkId,
          timestamp: new Date().toISOString()
        };

        const channelName = `user-${targetUser.clerkId}`;
        console.log('API: Preparing to send follow notification:', {
          channelName,
          data: notificationData
        });

        await pusherServer.trigger(
          channelName,
          'new-follow',
          notificationData
        );

        console.log('API: Follow notification sent successfully');
      } catch (notificationError) {
        console.error('API: Error sending follow notification:', notificationError);
      }

      return NextResponse.json({ isFollowing: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json(
      { 
        error: 'フォロー操作に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return new NextResponse('Target user ID is required', { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    const targetUser = await prisma.user.findUnique({
      where: { clerkId: targetUserId }
    });

    if (!currentUser || !targetUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    const follow = await prisma.follow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    return NextResponse.json(follow);
  } catch (error) {
    console.error('Unfollow error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 