"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import { useUser } from '@clerk/nextjs';
import SwipeCardList from "../components/SwipeCardList";

interface Card {
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
  const [cards, setCards] = React.useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts');
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error data:', errorData);
          throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched posts:', data);
        const formattedCards = data
          .map((post: any) => ({
            ...post,
            date: post.createdAt
          }))
          .sort((a: Card, b: Card) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        setCards(formattedCards);
      } catch (error) {
        console.error('データ取得エラーの詳細:', error);
        setError(error instanceof Error ? error.message : '不明なエラー');
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
        <main className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-lg mt-8">
          <div className="text-center">
            <p>読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-lg mt-8">
          <div className="text-center text-red-500">
            <p>エラーが発生しました: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-lg mt-8">
        {isSignedIn ? (
          <div className="flex justify-center">
            <SwipeCardList cards={cards} setCards={setCards} />
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-4xl font-bold">ようこそ、私たちのアプリへ</h1>
            <p className="text-lg">あなたにぴったりの相手を見つけましょう！</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;