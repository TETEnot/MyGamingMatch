"use client";

import React, { useEffect, useState } from 'react';
import AuthButtons from './AuthButtons';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Bell, Search, Settings, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pusherClient } from '@/lib/pusher';

// Define the type for newCard
// interface NewCard {
//   game: string;
//   description: string;
// }

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

interface DBUser {
  id: number;
  clerkId: string;
  username: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  statusMessage: string | null;
}

const Header = () => {
  const { isSignedIn, user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<DBUser | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!isSignedIn || !user) return;

      try {
        const response = await fetch(`/api/user/${user.id}`);
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        const { data } = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    fetchUser();
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const channelName = `user-${user.id}`;
    console.log('Header: Setting up Pusher subscription for channel:', channelName);

    const channel = pusherClient.subscribe(channelName);

    channel.bind('new-like', (data: LikeNotification) => {
      console.log('Header: Received notification:', data);
      setNotifications(prev => [data, ...prev]);
      toast.success(
        <div>
          <p className="font-bold">{data.likedBy}さんがいいねしました！</p>
          <p className="text-sm">投稿「{data.postTitle}」</p>
        </div>
      );
    });

    channel.bind('new-follow', (data: FollowNotification) => {
      console.log('Header: Received follow notification:', data);
      setNotifications(prev => [data, ...prev]);
      toast.success(
        <div>
          <Link href={`/user/${data.actorId}`} className="hover:underline">
            <p className="font-bold">{data.actorName}さんがあなたをフォローしました！</p>
          </Link>
        </div>
      );
    });

    return () => {
      console.log('Header: Cleaning up Pusher subscription');
      pusherClient.unsubscribe(channelName);
    };
  }, [isSignedIn, user]);

  // 未使用の関数を削除またはコメントアウト
  // const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setNewCard({ ...newCard, description: e.target.value });
  // };

  const renderNotificationContent = (notification: Notification) => {
    if (notification.type === 'LIKE') {
      return (
        <div className="py-2 border-b border-gray-200 last:border-0">
          <p className="text-gray-800 text-sm">
            {notification.likedBy}さんが「{notification.postTitle}」にいいねしました
          </p>
          <p className="text-gray-500 text-xs">
            {new Date(notification.timestamp).toLocaleString('ja-JP')}
          </p>
        </div>
      );
    } else if (notification.type === 'FOLLOW') {
      return (
        <div className="py-2 border-b border-gray-200 last:border-0">
          <Link href={`/user/${notification.actorId}`} className="hover:underline">
            <p className="text-gray-800 text-sm">
              {notification.actorName}さんがあなたをフォローしました
            </p>
          </Link>
          <p className="text-gray-500 text-xs">
            {new Date(notification.timestamp).toLocaleString('ja-JP')}
          </p>
        </div>
      );
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            ゲームマッチング
          </Link>

          <div className="flex items-center space-x-4">
            {isSignedIn && (
              <>
                <Link
                  href="/search"
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="検索"
                >
                  <Search className="w-6 h-6" />
                </Link>
                <Link
                  href="/likes"
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="いいね一覧"
                >
                  <Heart className="w-6 h-6" />
                </Link>
                <Link
                  href="/notifications"
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="通知"
                >
                  <Bell className="w-6 h-6" />
                </Link>
                <Link
                  href="/profile"
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="プロフィール設定"
                >
                  <Settings className="w-6 h-6" />
                </Link>
              </>
            )}
            {!isSignedIn && <AuthButtons />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;