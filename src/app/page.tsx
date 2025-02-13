"use client";

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useUser } from '@clerk/nextjs';
import SwipeCardList from "../components/SwipeCardList";

const HomePage = () => {
  const { isSignedIn } = useUser();
  const [cards, setCards] = useState([
    {
      name: 'アレックス',
      game: 'ゲームA',
      description: '一緒にプレイしませんか？',
      date: '2023-10-01',
    },
    {
      name: 'ジョン',
      game: 'ゲームB',
      description: '初心者歓迎！',
      date: '2023-10-02',
    },
    {
      name: 'ジェーン',
      game: 'ゲームC',
      description: '楽しくプレイしましょう！',
      date: '2023-10-03',
    },
  ]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/example');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched posts:', data);
        setCards(data);
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    fetchPosts();
  }, []);

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