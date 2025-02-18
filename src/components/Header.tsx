"use client";

import React, { useEffect, useState } from 'react';
import AuthButtons from './AuthButtons';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
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

const Header = () => {
  const { isSignedIn, user } = useUser();
  const [username, setUsername] = useState<string>('ゲスト');
  const [imageUrl, setImageUrl] = useState<string>('/default-avatar.png');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // const [newCard, setNewCard] = useState<NewCard>({ game: '', description: '' });

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

  useEffect(() => {
    async function fetchUser() {
      if (!isSignedIn || !user) {
        setUsername('ゲスト');
        setImageUrl('/default-avatar.png');
        return;
      }

      try {
        const response = await fetch(`/api/user/${user.id}`);
        
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }

        const { data } = await response.json();

        if (data) {
          setUsername(data.username || user.fullName || 'ゲスト');
          setImageUrl(data.avatarUrl || data.imageUrl || user.imageUrl || '/default-avatar.png');
        } else {
          setUsername(user.fullName || 'ゲスト');
          setImageUrl(user.imageUrl || '/default-avatar.png');
        }
      } catch (error) {
        console.error('Header: Error fetching user:', error);
        setUsername(user.fullName || 'ゲスト');
        setImageUrl(user.imageUrl || '/default-avatar.png');
      }
    }

    fetchUser();
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
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/" className="flex items-center hover:opacity-80">
        <div className="relative w-40 h-10">
          <Image
            src="/images/logo.png"
            alt="アプリロゴ"
            fill
            className="object-contain brightness-0 invert"
            priority
          />
        </div>
      </Link>
      <div className="flex items-center gap-4">
        {isSignedIn && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-700 rounded-full relative"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <h3 className="text-gray-800 font-semibold mb-2">通知</h3>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-600 text-sm">通知はありません</p>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={`${notification.timestamp}-${index}`}>
                          {renderNotificationContent(notification)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="relative w-8 h-8">
          <Image
            src={imageUrl}
            alt="Profile Icon"
            fill
            sizes="32px"
            className="rounded-full object-cover"
            priority
          />
        </div>
        <Link href={isSignedIn && user ? `/profile` : '/sign-in'} className="text-white cursor-pointer hover:underline">
          {username}
        </Link>
        {isSignedIn && (
          <Link href="/likes" className="text-white cursor-pointer hover:underline">
            いいね一覧
          </Link>
        )}
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;