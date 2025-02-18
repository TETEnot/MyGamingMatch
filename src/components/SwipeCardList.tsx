"use client";

import React, { useState } from 'react';
import TinderCard from 'react-tinder-card';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import PostAuthor from './PostAuthor';
import { Heart, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast';

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

const SwipeCardList = ({ cards, setCards }: { cards: Card[]; setCards: React.Dispatch<React.SetStateAction<Card[]>> }) => {
  const { isSignedIn, user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [newCard, setNewCard] = useState({ game: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const swipeThreshold = 150; // スワイプを検知する閾値

  const handleSwipe = async (direction: string, cardId: number) => {
    if (direction === 'right') {
      try {
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId: cardId }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'いいねの処理中にエラーが発生しました');
          return;
        }

        toast.success('いいねしました！');
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      } catch (error) {
        console.error('スワイプエラー:', error);
        toast.error('エラーが発生しました。もう一度お試しください。');
      }
    }
    if (!isSignedIn || !user || isLoading) return;

    setIsLoading(true);
    try {
      const endpoint = direction === 'right' ? '/api/likes' : '/api/bads';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: cardId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'リクエストに失敗しました');
      }

      setCards(prev => prev.filter(card => card.id !== cardId));
      setCurrentCardIndex(prevIndex => prevIndex + 1);
    } catch (error) {
      console.error('スワイプエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleAddNewCard() {
    if (!isSignedIn || !user || !newCard.game || !newCard.description) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: newCard.game,
          description: newCard.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();
      const newCardData: Card = {
        id: data.id,
        title: data.title,
        content: data.content,
        userId: data.userId,
        date: data.createdAt,
        username: data.username,
        avatarUrl: data.avatarUrl,
        imageUrl: data.imageUrl,
        statusMessage: data.statusMessage,
      };

      setCards(prevCards => [newCardData, ...prevCards]);
      setNewCard({ game: '', description: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('投稿の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  }

  const gameOptions = [
    'APEX', 'Fortnite', '原神', 'Maincraft', 'VALORANT',
    'MARVEL Rivals', 'MARVEL SNAP', 'モンスターストライク', 'ブロスタ', '荒野行動'
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="relative h-[600px] w-80">
        {cards.map((card, index) => (
          <TinderCard
            key={card.id}
            onSwipe={(dir) => handleSwipe(dir, card.id)}
            preventSwipe={['up', 'down']}
            swipeRequirementType="position"
            swipeThreshold={swipeThreshold}
            className={cn(
              "absolute w-full h-full transition-opacity duration-200",
              index < currentCardIndex ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <div className="select-none bg-white p-6 rounded-xl shadow-lg w-full min-h-[400px] text-black transform transition-all duration-200 hover:shadow-xl">
              <div className="mb-4">
                <PostAuthor userId={card.userId} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{card.title}</h3>
              <p className="mt-2 mb-4 min-h-[60px] text-gray-700 leading-relaxed">{card.content}</p>
              <p className="text-xs text-gray-400 mb-4">
                {new Date(card.date || Date.now()).toLocaleString('ja-JP')}
              </p>
              <div className="flex justify-between mt-auto">
                
                <button 
                  onClick={() => handleSwipe('left', card.id)}
                  disabled={!isSignedIn || isLoading}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-full transition-all duration-200",
                    "hover:bg-gray-100 hover:text-gray-700",
                    "text-gray-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <X className="w-6 h-6" />
                  <span className="text-sm font-medium">スキップ</span>
                </button>

                <button 
                  onClick={() => handleSwipe('right', card.id)}
                  disabled={!isSignedIn || isLoading}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-full transition-all duration-200",
                    "hover:bg-red-50 hover:text-red-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Heart className="w-6 h-6 transition-colors" />
                  <span className="text-sm font-medium">いいね</span>
                </button>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      {/* スワイプ方向のインジケーター */}
      <div className="fixed top-1/2 left-4 transform -translate-y-1/2 text-2xl text-red-500 opacity-50">←スキップ</div>
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 text-2xl text-green-500 opacity-50">いいね→</div>

      {isSignedIn && (
        <>
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-8 right-8 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
          >
            新規投稿
          </button>
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-xl font-bold mb-4 text-black">新しい投稿</h2>
                <select
                  value={newCard.game}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCard({ ...newCard, game: e.target.value })}
                  className="border p-2 mb-2 w-full text-gray-700"
                >
                  <option className='text-gray-700' value="" disabled>ゲームを選択してください</option>
                  {gameOptions.map((game) => (
                    <option className='text-gray-700' key={game} value={game}>{game}</option>
                  ))}
                </select>
                <textarea
                  placeholder="説明"
                  value={newCard.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCard({ ...newCard, description: e.target.value })}
                  className="border p-2 mb-2 w-full text-gray-700"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNewCard}
                    disabled={isSubmitting || !newCard.game || !newCard.description}
                    className="bg-green-500 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
                  >
                    {isSubmitting ? '投稿中...' : '投稿'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded w-full"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SwipeCardList;