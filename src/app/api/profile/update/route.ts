import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const clerkId = formData.get('clerkId') as string;
    const username = formData.get('username') as string;
    const statusMessage = formData.get('statusMessage') as string;
    const avatar = formData.get('avatar') as Blob | null;

    console.log('Received form data:', { clerkId, username, statusMessage, hasAvatar: !!avatar });

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Clerk IDが必要です' },
        { status: 400 }
      );
    }

    let avatarUrl = null;
    if (avatar) {
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        
        // アップロードディレクトリが存在することを確認
        try {
          await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
          console.log('Directory already exists or creation failed:', error);
        }

        const buffer = Buffer.from(await avatar.arrayBuffer());
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `avatar-${uniqueSuffix}.jpg`;
        const filepath = join(uploadsDir, filename);
        
        console.log('Saving image to:', filepath);
        await writeFile(filepath, buffer);
        avatarUrl = `/uploads/${filename}`;
        console.log('Image saved, URL:', avatarUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('画像のアップロードに失敗しました');
      }
    }

    console.log('Updating user with data:', {
      username,
      statusMessage,
      avatarUrl
    });

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        username,
        statusMessage,
        ...(avatarUrl && { avatarUrl }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        statusMessage: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    console.log('User updated successfully:', user);

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        error: 'プロフィールの更新に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}