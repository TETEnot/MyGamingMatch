"use client";

import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import AuthButtons from './AuthButtons';
import Link from 'next/link';
import ProfileImage from './ProfileImage';

const Header = () => {
  const { user, isLoaded } = useUser();
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (user) {
      console.log(user); // デバッグ用
      // 正しい画像URLを設定
      setImageUrl(user.unsafeMetadata.imageUrl || '/default-avatar.png');
    }
  }, [user]);

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