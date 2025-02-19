"use client";

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useUser, SignInButton } from '@clerk/nextjs';
import SwipeCardList from "../components/SwipeCardList";
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Gamepad2, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';

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
        if (!isSignedIn && isLoaded) {
          return; // ログアウト時は投稿の取得をスキップ
        }

        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('投稿の取得に失敗しました');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError(error instanceof Error ? error.message : '不明なエラー');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-cyber-darker"
      )}>
        <div className="animate-pulse text-cyber-green">読み込み中...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-cyber-darker"
      )}>
        <div className={cn(
          "p-8 rounded-lg",
          "bg-cyber-black",
          "border border-cyber-green",
          "shadow-neon-card",
          "text-center"
        )}>
          <h1 className={cn(
            "text-2xl font-cyber text-cyber-green mb-4",
            "animate-neon-pulse"
          )}>
            ようこそ
          </h1>
          <p className="text-cyber-green/80 font-cyber mb-6">
            ゲームマッチングを始めるにはログインしてください
          </p>
          <SignInButton mode="modal">
            <button
              className={cn(
                "px-6 py-2 rounded-lg",
                "bg-cyber-darker",
                "border border-cyber-green",
                "text-cyber-green font-cyber",
                "hover:bg-cyber-green hover:text-cyber-black",
                "transition-all duration-300",
                "shadow-neon-green"
              )}
            >
              ログイン
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-cyber-darker"
      )}>
        <div className={cn(
          "p-8 rounded-lg",
          "bg-cyber-black",
          "border border-cyber-green",
          "shadow-neon-card",
          "text-center"
        )}>
          <h1 className={cn(
            "text-2xl font-cyber text-cyber-green mb-4",
            "animate-neon-pulse"
          )}>
            エラーが発生しました
          </h1>
          <p className="text-cyber-green/80 font-cyber mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              "px-6 py-2 rounded-lg",
              "bg-cyber-darker",
              "border border-cyber-green",
              "text-cyber-green font-cyber",
              "hover:bg-cyber-green hover:text-cyber-black",
              "transition-all duration-300",
              "shadow-neon-green"
            )}
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isSignedIn ? (
          <div className="flex justify-center">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className={cn(
                  "w-12 h-12 border-2 border-cyber-green rounded-full",
                  "border-t-transparent animate-spin"
                )} />
              </div>
            ) : posts.length > 0 ? (
              <SwipeCardList cards={posts} setCards={setPosts} />
            ) : (
              <div className={cn(
                "text-center p-8",
                "bg-cyber-darker rounded-lg",
                "border border-cyber-green",
                "shadow-neon-card"
              )}>
                <h2 className="text-2xl font-cyber text-cyber-green animate-neon-pulse">
                  投稿がありません
                </h2>
                <p className="mt-2 text-cyber-green/70 font-cyber">
                  新しい投稿を待っています...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className={cn(
              "text-4xl font-cyber text-cyber-green mb-4",
              "animate-neon-pulse"
            )}>
              ようこそ、ゲームマッチングへ
            </h1>
            <p className="text-xl text-cyber-green/70 font-cyber mb-8">
              一緒にプレイする仲間を見つけましょう！
            </p>
            <div className="space-y-8">
              <div className={cn(
                "bg-cyber-darker p-8 rounded-lg",
                "border border-cyber-green",
                "shadow-neon-card"
              )}>
                <h2 className="text-2xl font-cyber text-cyber-green mb-6 animate-neon-pulse">
                  機能紹介
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={cn(
                    "p-4 rounded-lg",
                    "bg-cyber-black",
                    "border border-cyber-green",
                    "shadow-neon-green",
                    "transition-all duration-300",
                    "hover:shadow-neon-card hover:scale-105"
                  )}>
                    <Users className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                    <p className="text-cyber-green font-cyber">
                      プレイヤーとマッチング
                    </p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg",
                    "bg-cyber-black",
                    "border border-cyber-green",
                    "shadow-neon-green",
                    "transition-all duration-300",
                    "hover:shadow-neon-card hover:scale-105"
                  )}>
                    <Gamepad2 className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                    <p className="text-cyber-green font-cyber">
                      好きなゲームを共有
                    </p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg",
                    "bg-cyber-black",
                    "border border-cyber-green",
                    "shadow-neon-green",
                    "transition-all duration-300",
                    "hover:shadow-neon-card hover:scale-105"
                  )}>
                    <MessageSquare className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                    <p className="text-cyber-green font-cyber">
                      コミュニティに参加
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;