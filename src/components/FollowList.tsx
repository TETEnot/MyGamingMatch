"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FollowButton from './FollowButton';

interface FollowListProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

interface User {
  id: number;
  clerkId: string;
  username: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  statusMessage: string | null;
}

export default function FollowList({ isOpen, onClose, userId, type, title }: FollowListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/follow/${userId}?type=${type}`);
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('ユーザー情報を読み込めませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            {type === 'followers' ? 'フォロワーがいません' : 'フォローしているユーザーがいません'}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <Link
                  href={`/user/${user.clerkId}`}
                  className="flex items-center space-x-3 hover:opacity-80"
                >
                  <div className="relative w-10 h-10">
                    <Image
                      src={user.avatarUrl || user.imageUrl || '/default-avatar.png'}
                      alt={user.username || 'ユーザー'}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{user.username || 'ゲスト'}</p>
                    {user.statusMessage && (
                      <p className="text-sm text-gray-500">{user.statusMessage}</p>
                    )}
                  </div>
                </Link>
                <FollowButton targetUserId={user.clerkId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 