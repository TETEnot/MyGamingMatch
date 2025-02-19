"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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
      <div className={cn(
        "flex items-center space-x-3",
        "animate-pulse"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-full",
          "bg-cyber-darker",
          "border border-cyber-green/30"
        )} />
        <div className="flex-1 space-y-2">
          <div className={cn(
            "h-4 w-24 rounded",
            "bg-cyber-darker",
            "border border-cyber-green/30"
          )} />
          <div className={cn(
            "h-3 w-32 rounded",
            "bg-cyber-darker",
            "border border-cyber-green/30"
          )} />
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className={cn(
        "flex items-center space-x-3",
        "bg-cyber-darker rounded-lg",
        "border border-cyber-accent",
        "p-3"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-full",
          "bg-cyber-black",
          "border border-cyber-accent",
          "flex items-center justify-center"
        )}>
          <span className="text-cyber-accent font-cyber">?</span>
        </div>
        <div>
          <p className="text-cyber-accent font-cyber">
            ユーザーが見つかりません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center space-x-3",
      "group"
    )}>
      <Link
        href={`/user/${userData.clerkId}`}
        className={cn(
          "flex items-center space-x-3",
          "hover:opacity-80",
          "transition-opacity duration-300"
        )}
      >
        <div className="relative w-12 h-12">
          <Image
            src={userData.avatarUrl || userData.imageUrl || '/default-avatar.png'}
            alt={userData.username || 'ユーザー'}
            fill
            className={cn(
              "rounded-full object-cover",
              "border-2 border-cyber-green group-hover:border-cyber-accent",
              "shadow-neon-green group-hover:shadow-neon-card",
              "transition-all duration-300"
            )}
          />
        </div>
        <div>
          <h4 className={cn(
            "font-cyber text-cyber-green group-hover:text-cyber-accent",
            "transition-colors duration-300"
          )}>
            {userData.username || 'ゲスト'}
          </h4>
          {userData.statusMessage && (
            <p className="text-sm text-cyber-green/70 font-cyber">
              {userData.statusMessage}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PostAuthor;