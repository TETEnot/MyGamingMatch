import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    console.log('Auth userId:', clerkId) // デバッグログ

    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { postId } = body
    console.log('Received postId:', postId) // デバッグログ

    if (!postId) {
      return new NextResponse('Post ID is required', { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    })
    console.log('Found user:', user) // デバッグログ

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true }
    })
    console.log('Found post:', post) // デバッグログ

    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    // 既存のいいねをチェック
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: postId,
        userId: user.id
      }
    })
    console.log('Existing like:', existingLike) // デバッグログ

    if (existingLike) {
      return new NextResponse('Already liked', { status: 400 })
    }

    try {
      // トランザクションでいいねを作成し、投稿のいいね数を更新
      const [like] = await prisma.$transaction([
        prisma.like.create({
          data: {
            postId: postId,
            userId: user.id
          }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } }
        })
      ])
      console.log('Created like:', like) // デバッグログ

      // 通知をトリガー
      if (post.userId !== user.id) {
        try {
          const notificationData = {
            postId: post.id,
            likedBy: user.username,
            postTitle: post.title,
            timestamp: new Date().toISOString()
          };

          const channelName = `user-${post.user.clerkId}`;
          console.log('API: Preparing to send notification:', {
            channelName,
            data: notificationData,
            post,
            user,
            pusherConfig: {
              appId: process.env.PUSHER_APP_ID,
              key: process.env.NEXT_PUBLIC_PUSHER_KEY,
              secret: '***',
              cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
            }
          });

          await pusherServer.trigger(
            channelName,
            'new-like',
            notificationData
          ).catch((error) => {
            console.error('API: Pusher trigger error:', error);
            throw error;
          });

          console.log('API: Notification sent successfully to channel:', channelName);
        } catch (notificationError) {
          console.error('API: Error sending notification:', {
            error: notificationError,
            stack: notificationError instanceof Error ? notificationError.stack : undefined,
            channelName: `user-${post.user.clerkId}`,
            postId: post.id,
            userId: user.id
          });
        }
      } else {
        console.log('API: Skipping notification for self-like');
      }

      return NextResponse.json({ success: true, data: like })
    } catch (transactionError) {
      console.error('Transaction error:', transactionError)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Transaction failed', 
          details: transactionError instanceof Error ? transactionError.message : 'Unknown transaction error' 
        }), 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('LIKE_ERROR:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { postId } = body

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    await prisma.$transaction([
      prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId: user.id
          }
        }
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } }
      })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('UNLIKE_ERROR', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 