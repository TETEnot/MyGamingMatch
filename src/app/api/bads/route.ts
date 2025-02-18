import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json(
        { error: "投稿IDは必須です" },
        { status: 400 }
      );
    }

    // 現在のユーザーを取得
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    // 既存のバッドをチェック
    const existingBad = await prisma.bad.findFirst({
      where: {
        postId,
        userId: user.id
      }
    });

    if (existingBad) {
      return NextResponse.json(
        { error: "すでにバッド済みです" },
        { status: 400 }
      );
    }

    // バッドを作成
    const bad = await prisma.bad.create({
      data: {
        postId,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: bad
    });
  } catch (error) {
    console.error("バッドの作成中にエラーが発生しました:", error);
    return NextResponse.json(
      { 
        error: "バッドの作成中にエラーが発生しました",
        details: error instanceof Error ? error.message : "不明なエラー"
      },
      { status: 500 }
    );
  }
} 