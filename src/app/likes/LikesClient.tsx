"use client";

import { Post, User, Like } from '@prisma/client'
import PostCard from '@/components/PostCard'

type PostWithUser = Post & {
  user: User
  likes: Like[]
}

interface LikesClientProps {
  likedPosts: {
    post: PostWithUser
  }[]
  currentUserId: number
}

export default function LikesClient({ likedPosts, currentUserId }: LikesClientProps) {
  return (
    <div className="container mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">いいねした投稿</h1>
      {likedPosts.length === 0 ? (
        <p className="text-gray-900 text-center">いいねした投稿はありません</p>
      ) : (
        <div className="grid gap-4">
          {likedPosts.map(like => (
            <PostCard
              key={like.post.id}
              post={like.post}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
} 