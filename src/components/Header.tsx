"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { SignOutButton } from '@clerk/nextjs';
import { Bell, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';

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
  const [showNotifications, setShowNotifications] = useState(false);

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
    });

    channel.bind('new-follow', (data: FollowNotification) => {
      console.log('Header: Received notification:', data);
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      console.log('Header: Cleaning up Pusher subscription');
      pusherClient.unsubscribe(channelName);
    };
  }, [isSignedIn, user]);

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'LIKE':
        return (
          <div className="text-cyber-green">
            <span className="font-cyber">{notification.likedBy}</span>
            <span className="text-cyber-green/70">さんが「{notification.postTitle}」にいいねしました</span>
          </div>
        );
      case 'FOLLOW':
        return (
          <div className="text-cyber-green">
            <span className="font-cyber">{notification.actorName}</span>
            <span className="text-cyber-green/70">さんがあなたをフォローしました</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "bg-cyber-darker border-b border-cyber-green",
      "shadow-neon-card"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-cyber text-2xl text-cyber-green animate-neon-pulse">
            Game Matching
          </Link>

          <nav className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/search"
                  className="text-cyber-green hover:text-cyber-accent transition-colors"
                >
                  検索
                </Link>
                <Link
                  href="/likes"
                  className="text-cyber-green hover:text-cyber-accent transition-colors"
                >
                  いいね一覧
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={cn(
                      "p-2 rounded-full transition-all duration-300",
                      "text-cyber-green hover:text-cyber-accent",
                      "hover:bg-cyber-green/20"
                    )}
                  >
                    <Bell className="w-6 h-6" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-accent rounded-full text-xs flex items-center justify-center text-cyber-black">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className={cn(
                      "absolute right-0 mt-2 w-80",
                      "bg-cyber-darker border border-cyber-green rounded-lg",
                      "shadow-neon-card"
                    )}>
                      <div className="p-2">
                        {notifications.length === 0 ? (
                          <p className="text-cyber-green/70 text-center py-4">通知はありません</p>
                        ) : (
                          <div className="space-y-2">
                            {notifications.map((notification, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "p-3 rounded-lg",
                                  "border border-cyber-green/30",
                                  "hover:border-cyber-green hover:shadow-neon-green",
                                  "transition-all duration-300"
                                )}
                              >
                                {renderNotificationContent(notification)}
                                <p className="text-xs text-cyber-green/50 mt-1">
                                  {new Date(notification.timestamp).toLocaleString('ja-JP')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link href="/profile" className="relative w-8 h-8">
                  <Image
                    src={currentUser?.avatarUrl || currentUser?.imageUrl || '/default-avatar.png'}
                    alt="プロフィール"
                    fill
                    className="rounded-full border border-cyber-green shadow-neon-green"
                  />
                </Link>
                <SignOutButton>
                  <button className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-cyber-darker border border-cyber-green",
                    "text-cyber-green hover:text-cyber-accent",
                    "hover:shadow-neon-green transition-all duration-300"
                  )}>
                    <LogOut className="w-4 h-4" />
                    <span>ログアウト</span>
                  </button>
                </SignOutButton>
              </>
            ) : (
              <Link
                href="/sign-in"
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "bg-cyber-green text-cyber-black",
                  "hover:bg-cyber-accent transition-colors",
                  "shadow-neon-green"
                )}
              >
                ログイン
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;