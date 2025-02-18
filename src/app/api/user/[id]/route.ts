import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching user with clerkId:', params.id);

    if (!params.id) {
      return NextResponse.json(
        { error: 'ユーザーIDが指定されていません' },
        { status: 400 }
      );
    }

    console.log('Searching for user with clerkId:', params.id);

    const user = await prisma.user.findUnique({
      where: { clerkId: params.id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        imageUrl: true,
        statusMessage: true,
        email: true,
        clerkId: true,
      },
    });

    console.log('Database query result:', user);

    console.log('Found user:', user);

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        error: 'ユーザー情報の取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 