"use client";

import { Post, User, Like } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import LikeButton from './LikeButton'
import FollowButton from './FollowButton'
import { cn } from '@/lib/utils'

type PostWithUser = Post & {
  user: User
  likes: Like[]
}

interface PostCardProps {
  post: PostWithUser | {
    id: number;
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    username: string;
    avatarUrl?: string;
    imageUrl?: string;
    statusMessage?: string;
    likeCount: number;
    isLiked: boolean;
    user: {
      id: number;
      username: string;
      avatarUrl: string | null;
      imageUrl: string | null;
    };
    likes: any[];
  }
}

export default function PostCard({ post }: PostCardProps) {
  const createdAt = typeof post.createdAt === 'string' 
    ? new Date(post.createdAt)
    : post.createdAt;

  if (!createdAt || isNaN(createdAt.getTime())) {
    console.error('Invalid date:', post.createdAt);
    return null;
  }

  return (
    <div className={cn(
      "bg-cyber-darker rounded-lg p-6",
      "border border-cyber-green",
      "shadow-neon-card hover:shadow-neon-green",
      "transition-all duration-300",
      "group"
    )}>
      <div className="flex items-start space-x-4">
        <Link href={`/user/${post.user.id}`}>
          <div className="relative w-12 h-12">
            <Image
              src={post.user.avatarUrl || post.user.imageUrl || '/default-avatar.png'}
              alt={post.user.username || 'ユーザー'}
              fill
              className={cn(
                "rounded-full object-cover",
                "border-2 border-cyber-green group-hover:border-cyber-accent",
                "shadow-neon-green group-hover:shadow-neon-card",
                "transition-all duration-300"
              )}
            />
          </div>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/user/${post.user.id}`}
                className={cn(
                  "font-cyber text-lg",
                  "text-cyber-green hover:text-cyber-accent",
                  "transition-colors duration-300",
                  "animate-neon-pulse"
                )}
              >
                {post.user.username || 'ゲスト'}
              </Link>
              <FollowButton targetUserId={post.user.id.toString()} className="ml-2" />
            </div>
            <span className="text-sm text-cyber-green/70 font-cyber">
              {formatDistanceToNow(createdAt, {
                addSuffix: true,
                locale: ja
              })}
            </span>
          </div>
          <p className={cn(
            "mt-3 text-cyber-green/90",
            "font-cyber leading-relaxed"
          )}>
            {post.content}
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <LikeButton
              postId={post.id}
              initialLikeCount={'likeCount' in post ? post.likeCount : post.likes.length}
              initialIsLiked={'isLiked' in post ? post.isLiked : false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}