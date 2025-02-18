"use client";

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useUser } from '@clerk/nextjs';
import SwipeCardList from "../components/SwipeCardList";
import { toast } from 'react-hot-toast';

interface Post {
  id: number;
  title: string;
  content: string;
  userId: string;
  date: string;
  username: string;
  avatarUrl?: string;
  imageUrl?: string;
  statusMessage?: string;
}

const HomePage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('投稿の取得に失敗しました');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        console.error('Error fetching posts:', err);
        toast.error('投稿の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      fetchPosts();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">エラーが発生しました: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              再読み込み
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isSignedIn ? (
          <div className="flex justify-center">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : posts.length > 0 ? (
              <SwipeCardList cards={posts} setCards={setPosts} />
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-700">投稿がありません</h2>
                <p className="mt-2 text-gray-500">新しい投稿を待っています...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ようこそ、ゲームマッチングへ</h1>
            <p className="text-xl text-gray-600 mb-8">一緒にプレイする仲間を見つけましょう！</p>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">機能紹介</h2>
                <ul className="text-left space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2">👥</span>
                    <span>プレイヤーとマッチング</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🎮</span>
                    <span>好きなゲームを共有</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">💬</span>
                    <span>コミュニティに参加</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;