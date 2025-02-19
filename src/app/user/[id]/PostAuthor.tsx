"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PostAuthorProps {
  userId: number;
}

interface User {
  id: number;
  username: string;
  avatarUrl: string | null;
  imageUrl: string | null;
}

export default function PostAuthor({ userId }: PostAuthorProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error('ユーザー情報の取得に失敗しました');
        const { data } = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-2",
        "bg-cyber-darker/50 rounded-lg",
        "border border-cyber-green/30",
        "p-2"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full",
          "bg-cyber-darker",
          "border border-cyber-green/30"
        )} />
        <div className="h-4 w-24 bg-cyber-darker rounded animate-pulse" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={cn(
        "flex items-center gap-2",
        "bg-cyber-darker/50 rounded-lg",
        "border border-cyber-red/30",
        "p-2"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full",
          "bg-cyber-darker",
          "border border-cyber-red/30"
        )} />
        <span className="text-cyber-red/80 font-cyber text-sm">
          ユーザーが見つかりません
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/user/${userId}`}
      className={cn(
        "flex items-center gap-2",
        "bg-cyber-darker/50 rounded-lg",
        "border border-cyber-green/30",
        "p-2",
        "transition-all duration-300",
        "hover:bg-cyber-darker hover:border-cyber-green",
        "group"
      )}
    >
      <div className="relative w-8 h-8">
        <Image
          src={user.avatarUrl || user.imageUrl || '/default-avatar.png'}
          alt={user.username}
          fill
          className={cn(
            "rounded-full object-cover",
            "border border-cyber-green/30",
            "transition-all duration-300",
            "group-hover:border-cyber-green",
            "group-hover:shadow-neon-green"
          )}
        />
      </div>
      <span className={cn(
        "font-cyber text-cyber-green",
        "transition-colors duration-300",
        "group-hover:text-cyber-accent",
        "animate-neon-pulse"
      )}>
        {user.username}
      </span>
    </Link>
  );
} 