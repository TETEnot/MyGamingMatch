"use client";

import { Post, User, Like } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import LikeButton from './LikeButton'

type PostWithUser = Post & {
  user: User
  likes: Like[]
}

interface PostCardProps {
  post: PostWithUser
  currentUserId?: number
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const isLiked = post.likes.some(like => like.userId === currentUserId)

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start space-x-3">
        <Link href={`/user/${post.user.clerkId}`}>
          <Image
            src={post.user.avatarUrl || '/default-avatar.png'}
            alt={post.user.username}
            width={40}
            height={40}
            className="rounded-full"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link
              href={`/user/${post.user.clerkId}`}
              className="font-semibold hover:underline"
            >
              {post.user.username}
            </Link>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ja
              })}
            </span>
          </div>
          <p className="mt-2 text-gray-900">{post.content}</p>
          <div className="mt-3 flex items-center space-x-4">
            <LikeButton
              postId={post.id}
              initialLikeCount={post.likeCount}
              initialIsLiked={isLiked}
            />
          </div>
        </div>
      </div>
    </div>
  )
}