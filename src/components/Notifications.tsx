"use client";

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

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
      toast.success(
        <div>
          <p className="font-bold">{data.likedBy}さんがいいねしました！</p>
          <p className="text-sm">投稿「{data.postTitle}」</p>
        </div>
      )
    })

    channel.bind('new-follow', (data: FollowNotification) => {
      console.log('Notifications: Received new-follow event:', data)
      setNotifications(prev => [data, ...prev])
      toast.success(
        <div>
          <Link href={`/user/${data.actorId}`} className="hover:underline">
            <p className="font-bold">{data.actorName}さんがあなたをフォローしました！</p>
          </Link>
        </div>
      )
    })

    return () => {
      console.log('Notifications: Cleaning up subscription for channel:', channelName)
      pusherClient.unsubscribe(channelName)
    }
  }, [user])

  return null
} 