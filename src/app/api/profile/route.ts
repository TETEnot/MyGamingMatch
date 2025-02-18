import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    const authHeader = request.headers.get('Authorization');

    console.log('Received request for clerkId:', clerkId);
    console.log('Authorization header:', authHeader);

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Clerk IDが指定されていません' },
        { status: 400 }
      );
    }

    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        imageUrl: true,
        statusMessage: true,
      },
    });

    console.log('Found user:', user);

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      {
        error: 'ユーザー情報の取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 