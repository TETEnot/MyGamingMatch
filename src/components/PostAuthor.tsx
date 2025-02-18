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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('ユーザーIDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        
        const { data } = await response.json();
        
        if (!data) {
          throw new Error('ユーザーデータが見つかりません');
        }

        setUserData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('ユーザー情報を読み込めませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-32 mt-2"></div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-400">?</span>
        </div>
        <div>
          <p className="text-gray-500">ユーザーが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Link href={`/user/${userData.clerkId}`} className="flex items-center space-x-3 hover:opacity-80">
        <div className="relative w-12 h-12">
          <Image
            src={userData.avatarUrl || userData.imageUrl || '/default-avatar.png'}
            alt={userData.username || 'ユーザー'}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-lg text-blue-600 hover:underline">
            {userData.username || 'ゲスト'}
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