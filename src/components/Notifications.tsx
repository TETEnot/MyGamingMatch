"use client";

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Heart, UserPlus } from 'lucide-react'

interface LikeNotification {
  type: 'LIKE';
  postId: number;
  likedBy: string;
  postTitle: string;
  timestamp: string;
}

interface FollowNotification {
  type: 'FOLLOW';
  actorName: string;
  actorId: string;
  timestamp: string;
}

type Notification = LikeNotification | FollowNotification;

export default function Notifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return

    const channelName = `user-${user.id}`
    console.log('Notifications: Setting up Pusher subscription for channel:', channelName)

    // 既存の購読を解除
    pusherClient.unsubscribe(channelName)

    const channel = pusherClient.subscribe(channelName)

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Notifications: Successfully subscribed to channel:', channelName)
    })

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Notifications: Subscription error:', error)
    })

    channel.bind('new-like', (data: LikeNotification) => {
      console.log('Notifications: Received new-like event:', data)
      setNotifications(prev => [data, ...prev])
      toast.custom((t) => (
        <div
          className={cn(
            "bg-cyber-darker rounded-lg",
            "border border-cyber-green",
            "shadow-neon-card",
            "p-4 max-w-md",
            "transform transition-all duration-300",
            t.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-cyber-accent mt-1" />
            <div>
              <p className="font-cyber text-cyber-green">
                <span className="text-cyber-accent">{data.likedBy}</span>
                さんがいいねしました！
              </p>
              <p className="text-sm text-cyber-green/70 font-cyber mt-1">
                投稿「{data.postTitle}」
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
      })
    })

    channel.bind('new-follow', (data: FollowNotification) => {
      console.log('Notifications: Received new-follow event:', data)
      setNotifications(prev => [data, ...prev])
      toast.custom((t) => (
        <div
          className={cn(
            "bg-cyber-darker rounded-lg",
            "border border-cyber-green",
            "shadow-neon-card",
            "p-4 max-w-md",
            "transform transition-all duration-300",
            t.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-cyber-accent mt-1" />
            <div>
              <Link
                href={`/user/${data.actorId}`}
                className={cn(
                  "font-cyber text-cyber-green",
                  "hover:text-cyber-accent transition-colors duration-300"
                )}
              >
                <span className="text-cyber-accent">{data.actorName}</span>
                さんがあなたをフォローしました！
              </Link>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
      })
    })

    return () => {
      console.log('Notifications: Cleaning up subscription for channel:', channelName)
      pusherClient.unsubscribe(channelName)
    }
  }, [user])

  return null
} 