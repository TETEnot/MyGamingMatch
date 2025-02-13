"use client";

import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import AuthButtons from './AuthButtons';
import Link from 'next/link';
import ProfileImage from './ProfileImage';

// Define the type for newCard
// interface NewCard {
//   game: string;
//   description: string;
// }

const Header = () => {
  const { user, isLoaded } = useUser();
  const [imageUrl, setImageUrl] = useState('');
  // const [newCard, setNewCard] = useState<NewCard>({ game: '', description: '' });

  useEffect(() => {
    if (user) {
      console.log(user); // デバッグ用
      // 正しい画像URLを設定
      const image = user.unsafeMetadata.imageUrl;
      setImageUrl(typeof image === 'string' ? image : '/default-avatar.png');
    }
  }, [user]);

  // 未使用の関数を削除またはコメントアウト
  // const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setNewCard({ ...newCard, description: e.target.value });
  // };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-2xl">私たちのアプリ</h1>
      <div className="flex items-center gap-4">
        {imageUrl && <ProfileImage imageUrl={imageUrl} />}
        <Link href="/profile">
          <span className="text-white cursor-pointer">
            {typeof user?.unsafeMetadata?.username === 'string' ? user.unsafeMetadata.username : 'ゲスト'}
          </span>
        </Link>
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;