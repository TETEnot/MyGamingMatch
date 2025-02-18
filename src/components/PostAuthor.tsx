"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface PostAuthorProps {
  userId: string;  // これはclerkIdです
}

interface UserData {
  username: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  statusMessage: string | null;
  clerkId: string;
}

const PostAuthor: React.FC<PostAuthorProps> = ({ userId }) => {
  const { user: currentUser } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        console.log('Fetching user data for userId:', userId);
        const response = await fetch(`/api/user/${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'ユーザー情報の取得に失敗しました');
        }
        
        const { data } = await response.json();
        console.log('Received user data:', data);
        
        if (!data) {
          throw new Error('ユーザーデータが見つかりません');
        }

        setUserData(data);
      } catch (error) {
        setError('ユーザー情報を読み込めませんでした');
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return <div className="animate-pulse">読み込み中...</div>;
  }

  if (error || !userData) {
    return <div className="text-gray-500">ユーザーが見つかりません</div>;
  }

  return (
    <div className="flex items-center space-x-3">
      <Link href={`/user/${userData.clerkId}`} className="flex items-center space-x-3 hover:opacity-80">
        <div className="relative w-12 h-12">
          <Image
            src={userData.avatarUrl || userData.imageUrl || '/default-avatar.png'}
            alt={userData.username}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-lg text-blue-600 hover:underline">
            {userData.username}
          </h4>
          {userData.statusMessage && (
            <p className="text-sm text-gray-500">{userData.statusMessage}</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PostAuthor;