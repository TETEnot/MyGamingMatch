import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json({ error: 'Clerk ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        username: true,
        email: true,
        statusMessage: true,
        avatarUrl: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Fetched user data:', user);

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
} 