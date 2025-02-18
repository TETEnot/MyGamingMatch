import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clerkId, username, email, imageUrl, statusMessage } = req.body;

  if (!clerkId || !email) {
    return res.status(400).json({
      error: '必須フィールドが不足しています',
      details: `Required: ${!clerkId ? 'clerkId, ' : ''}${!email ? 'email' : ''}`
    });
  }

  try {
    console.log('Saving user with data:', { clerkId, username, email, imageUrl, statusMessage });

    // 既存のユーザーを確認
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    console.log('Existing user:', existingUser);

    // プロフィールページからの更新かどうかを判断
    const isProfileUpdate = req.headers['x-update-source'] === 'profile';

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        // プロフィールページからの更新の場合は新しい値を優先
        username: isProfileUpdate ? username : existingUser?.username || username,
        email: isProfileUpdate ? email : existingUser?.email || email,
        avatarUrl: isProfileUpdate ? imageUrl : existingUser?.avatarUrl || imageUrl,
        imageUrl: isProfileUpdate ? imageUrl : existingUser?.imageUrl || imageUrl,
        // statusMessageは常に新しい値を使用（空文字列の場合は既存の値を保持）
        statusMessage: statusMessage || existingUser?.statusMessage,
        updatedAt: new Date(),
      },
      create: {
        clerkId,
        username: username || 'ゲスト',
        email,
        avatarUrl: imageUrl,
        imageUrl: imageUrl,
        statusMessage,
      },
    });

    console.log('User saved successfully:', user);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({
      error: 'ユーザー情報の保存に失敗しました',
      details: error instanceof Error ? error.message : '不明なエラー'
    });
  } finally {
    await prisma.$disconnect();
  }
} 