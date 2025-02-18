"use client";

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: number
  initialLikeCount: number
  initialIsLiked: boolean
}

export default function LikeButton({
  postId,
  initialLikeCount,
  initialIsLiked,
}: LikeButtonProps) {
  const { isSignedIn } = useUser()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!isSignedIn || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/likes', {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
      } else {
        const error = await response.json()
        console.error('いいねの送信に失敗しました:', error)
      }
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={!isSignedIn || isLoading}
      className={cn(
        "flex items-center gap-2 p-2 rounded-full transition-all duration-200",
        "hover:bg-red-50",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <Heart
        className={cn(
          "w-6 h-6 transition-colors duration-200",
          isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
        )}
      />
      <span className={cn(
        "text-sm font-medium",
        isLiked ? "text-red-500" : "text-gray-500"
      )}>
        {likeCount}
      </span>
    </button>
  )
} 