"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Bell, Heart, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Notification {
  id: number;
  type: 'like' | 'follow';
  userId: number;
  targetId: number;
  createdAt: string;
  read: boolean;
  user: {
    username: string;
    avatarUrl: string | null;
    imageUrl: string | null;
  };
}

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error('通知の取得に失敗しました');
        const { data } = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('通知の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('通知の既読処理に失敗しました');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('通知の既読処理に失敗しました');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            handleMarkAsRead();
          }
        }}
        className={cn(
          "p-2 rounded-full",
          "bg-cyber-darker",
          "border border-cyber-green",
          "text-cyber-green",
          "hover:bg-cyber-green hover:text-cyber-black",
          "transition-colors duration-300",
          "relative"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1",
            "w-5 h-5",
            "flex items-center justify-center",
            "bg-cyber-red text-cyber-black",
            "text-xs font-cyber rounded-full",
            "animate-pulse"
          )}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2",
          "w-80",
          "bg-cyber-black rounded-lg",
          "border border-cyber-green",
          "shadow-neon-card",
          "z-50"
        )}>
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className={cn(
                "w-6 h-6 mx-auto",
                "text-cyber-green",
                "animate-spin"
              )} />
            </div>
          ) : notifications.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-cyber-green/30",
                    "hover:bg-cyber-darker",
                    "transition-colors duration-300",
                    !notification.read && "bg-cyber-darker/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {notification.type === 'like' ? (
                      <Heart className="w-5 h-5 text-cyber-red" />
                    ) : (
                      <UserPlus className="w-5 h-5 text-cyber-green" />
                    )}
                    <div className="flex-1">
                      <p className="text-cyber-green font-cyber">
                        <span className="text-cyber-accent">
                          {notification.user.username}
                        </span>
                        {notification.type === 'like' ? (
                          ' があなたの投稿にいいねしました'
                        ) : (
                          ' があなたをフォローしました'
                        )}
                      </p>
                      <time className="text-xs text-cyber-green/60 font-cyber">
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-cyber-green/80 font-cyber">
                通知はありません
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 