import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { postId } = await req.json()
    if (!postId) {
      return NextResponse.json(
        { error: '投稿IDは必須です' },
        { status: 400 }
      )
    }

    // 現在のユーザーを取得
    const user = await prisma.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // 既存のいいねをチェック
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId: user.id
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { error: '既にいいね済みです' },
        { status: 400 }
      )
    }

    // いいねを作成
    const like = await prisma.like.create({
      data: {
        postId,
        userId: user.id
      }
    })

    // 投稿のいいね数を更新
    await prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: {
          increment: 1
        }
      }
    })

    // 通知の送信
    try {
      const notificationData = {
        type: 'LIKE',
        postId: post.id,
        likedBy: user.username || 'ゲスト',
        postTitle: post.title,
        timestamp: new Date().toISOString()
      }

      const channelName = `user-${post.user.clerkId}`
      await pusherServer.trigger(
        channelName,
        'new-like',
        notificationData
      )
    } catch (notificationError) {
      console.error('通知の送信に失敗しました:', notificationError)
    }

    return NextResponse.json({
      success: true,
      data: like
    })
  } catch (error) {
    console.error('いいねの作成中にエラーが発生しました:', error)
    return NextResponse.json(
      { 
        error: 'いいねの作成中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { postId } = await req.json()
    if (!postId) {
      return NextResponse.json(
        { error: '投稿IDは必須です' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const like = await prisma.like.findFirst({
      where: {
        postId,
        userId: user.id
      }
    })

    if (!like) {
      return NextResponse.json(
        { error: 'いいねが見つかりません' },
        { status: 404 }
      )
    }

    // いいねを削除
    await prisma.like.delete({
      where: {
        id: like.id
      }
    })

    // 投稿のいいね数を更新
    await prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'いいねを削除しました'
    })
  } catch (error) {
    console.error('いいねの削除中にエラーが発生しました:', error)
    return NextResponse.json(
      { 
        error: 'いいねの削除中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}