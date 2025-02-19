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
    <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-black">
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
            <div className="select-none bg-cyber-darker border border-cyber-green p-6 rounded-xl shadow-neon-card w-full min-h-[400px] text-cyber-green transform transition-all duration-200">
              <div className="mb-4">
                <PostAuthor userId={card.userId} />
              </div>
              <h3 className="text-xl font-bold mb-2 animate-neon-pulse">{card.title}</h3>
              <p className="mt-2 mb-4 min-h-[60px] text-cyber-green/80 leading-relaxed">{card.content}</p>
              <p className="text-xs text-cyber-green/60 mb-4">
                {new Date(card.date || Date.now()).toLocaleString('ja-JP')}
              </p>
              <div className="flex justify-between mt-auto">
                <button 
                  onClick={() => handleSwipe('left', card.id)}
                  disabled={!isSignedIn || isLoading}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-full transition-all duration-200",
                    "hover:bg-cyber-dark hover:text-cyber-green hover:shadow-neon-green",
                    "text-cyber-green/70",
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
                    "hover:bg-cyber-green/20 hover:text-cyber-green hover:shadow-neon-green",
                    "text-cyber-green/70",
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
      <div className="fixed top-1/2 left-4 transform -translate-y-1/2 text-2xl text-cyber-green/50 animate-neon-pulse">←スキップ</div>
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 text-2xl text-cyber-green/50 animate-neon-pulse">いいね→</div>

      {isSignedIn && (
        <>
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-8 right-8 bg-cyber-darker border border-cyber-green text-cyber-green px-4 py-2 rounded-full shadow-neon-green hover:bg-cyber-green hover:text-cyber-black transition-all duration-300"
          >
            新規投稿
          </button>
          {showForm && (
            <div className="fixed inset-0 bg-cyber-black/90 flex justify-center items-center z-50">
              <div className="bg-cyber-darker border border-cyber-green p-6 rounded-lg shadow-neon-card w-80">
                <h2 className="text-xl font-bold mb-4 text-cyber-green animate-neon-pulse">新しい投稿</h2>
                <select
                  value={newCard.game}
                  onChange={(e) => setNewCard({ ...newCard, game: e.target.value })}
                  className="bg-cyber-dark border border-cyber-green text-cyber-green p-2 mb-2 w-full rounded focus:outline-none focus:shadow-neon-green"
                >
                  <option className="bg-cyber-darker text-cyber-green" value="" disabled>ゲームを選択してください</option>
                  {gameOptions.map((game) => (
                    <option className="bg-cyber-darker text-cyber-green" key={game} value={game}>{game}</option>
                  ))}
                </select>
                <textarea
                  placeholder="説明"
                  value={newCard.description}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  className="bg-cyber-dark border border-cyber-green text-cyber-green p-2 mb-2 w-full rounded focus:outline-none focus:shadow-neon-green"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNewCard}
                    disabled={isSubmitting || !newCard.game || !newCard.description}
                    className="bg-cyber-darker border border-cyber-green text-cyber-green px-4 py-2 rounded w-full hover:bg-cyber-green hover:text-cyber-black transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-cyber-green"
                  >
                    {isSubmitting ? '投稿中...' : '投稿'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="bg-cyber-dark border border-cyber-green text-cyber-green px-4 py-2 rounded w-full hover:bg-cyber-green hover:text-cyber-black transition-all duration-300"
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