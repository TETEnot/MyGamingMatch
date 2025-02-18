"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import { useUser } from '@clerk/nextjs';
import FollowButton from '@/components/FollowButton';
import FollowStats from '@/components/FollowStats';

interface UserProfile {
  id: number;
  username: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  statusMessage: string | null;
  email: string;
  clerkId: string;
  _count?: {
    followers: number;
    following: number;
  };
}

interface UserPost {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface UserProfileClientProps {
  id: string;
}

const UserProfileClient: React.FC<UserProfileClientProps> = ({ id }) => {
  const { user: currentUser, isLoaded: isUserLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) {
        console.error('No user ID provided');
        setError('ユーザーIDが指定されていません');
        setIsLoading(false);
        return;
      }

      if (!isUserLoaded) {
        console.log('Waiting for Clerk user to load...');
        return;
      }

      try {
        console.log('Attempting to fetch user profile for Clerk ID:', id);
        const token = currentUser?.id || '';
        console.log('Using authorization token:', token);

        const profileResponse = await fetch(`/api/user/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Profile response status:', profileResponse.status);
        const responseText = await profileResponse.text();
        console.log('Raw response:', responseText);

        if (!profileResponse.ok) {
          let errorMessage = 'ユーザー情報の取得に失敗しました';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }

        const responseData = JSON.parse(responseText);
        console.log('Parsed profile response:', responseData);
        
        if (!responseData.data) {
          throw new Error('ユーザーデータが見つかりません');
        }

        setUserProfile(responseData.data);
        console.log('Set user profile:', responseData.data);

        // 投稿一覧の取得
        if (responseData.data.id) {
          console.log('Fetching posts for user ID:', responseData.data.id);
          const postsResponse = await fetch(`/api/posts?userId=${responseData.data.clerkId}`);
          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            console.log('Received posts:', postsData);
            setUserPosts(postsData);
          } else {
            console.warn('Failed to fetch posts:', postsResponse.status);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error instanceof Error ? error.message : '不明なエラー');
      } finally {
        setIsLoading(false);
      }
    };

    if (isUserLoaded) {
      fetchUserData();
    }
  }, [id, currentUser, isUserLoaded]);

  console.log('Current state:', { isLoading, error, userProfile, userPosts });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="p-8 max-w-2xl mx-auto">
          <div className="text-center text-red-500">
            <p>エラーが発生しました: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="p-8 max-w-2xl mx-auto">
          <div className="text-center">
            <p>読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-8 max-w-2xl mx-auto">
        {/* プロフィール情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24">
              <Image
                src={userProfile.avatarUrl || userProfile.imageUrl || '/default-avatar.png'}
                alt={userProfile.username}
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-black">{userProfile.username}</h1>
                {currentUser?.id !== userProfile.clerkId && (
                  <FollowButton targetUserId={userProfile.clerkId} />
                )}
              </div>
              {userProfile.statusMessage && (
                <p className="text-black mt-2">{userProfile.statusMessage}</p>
              )}
              <div className="mt-4">
                <FollowStats
                  userId={userProfile.clerkId}
                  followersCount={userProfile._count?.followers || 0}
                  followingCount={userProfile._count?.following || 0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 投稿一覧 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">投稿一覧</h2>
          {userPosts.length === 0 ? (
            <p className="text-black">まだ投稿がありません</p>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-black">{post.title}</h3>
                  <p className="text-black mt-2">{post.content}</p>
                  <p className="text-sm text-black mt-2">
                    {new Date(post.date).toLocaleString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfileClient; 