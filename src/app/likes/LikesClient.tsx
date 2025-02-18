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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">いいねした投稿</h1>
      <div className="grid gap-4">
        {likedPosts.map(like => (
          <PostCard
            key={like.post.id}
            post={like.post}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  )
} 