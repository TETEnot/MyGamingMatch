"use client";

import React, { useState } from 'react';
import TinderCard from 'react-tinder-card';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import PostAuthor from './PostAuthor';
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newCard, setNewCard] = useState({ game: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hiddenPostIds, setHiddenPostIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSwipe = async (direction: string) => {
    console.log('あなたはスワイプしました: ' + direction);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);

    if (direction === 'right' && isSignedIn && user) {
      const currentCard = cards[currentIndex];
      try {
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId: currentCard.id }),
        });

        if (response.ok) {
          // いいねした投稿を非表示にする
          setHiddenPostIds(prev => [...prev, currentCard.id]);
          // カード一覧から削除
          setCards(prev => prev.filter(card => card.id !== currentCard.id));
        } else {
          console.error('いいねの送信に失敗しました');
        }
      } catch (error) {
        console.error('いいねエラー:', error);
      }
    }
  };

  const onCardLeftScreen = (myIdentifier: string) => {
    console.log(myIdentifier + ' が画面から消えました');
  };

  const handleLike = async (card: Card) => {
    if (!isSignedIn || !user || isLoading) return;

    setIsLoading(true);
    try {
      console.log('Sending like request for card:', card)

      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: card.id }),
      });

      const data = await response.json();
      console.log('Like response:', data)

      if (response.ok) {
        setHiddenPostIds(prev => [...prev, card.id]);
        setCards(prev => prev.filter(c => c.id !== card.id));
      } else {
        console.error('いいねの送信に失敗しました:', data.error, data.details);
        alert(`いいねの送信に失敗しました: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('いいねエラー:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  async function handleAddNewCard() {
    if (!isSignedIn || !user || !newCard.game || !newCard.description) {
      return;
    }

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
      
      // 新しい投稿をカードリストに追加
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

  // 表示するカードをフィルタリング
  const visibleCards = cards.filter(card => !hiddenPostIds.includes(card.id));

  const gameOptions = [
    'APEX', 'Fortnite', '原神', 'Maincraft', 'VALORANT',
    'MARVEL Rivals', 'MARVEL SNAP', 'モンスターストライク', 'ブロスタ', '荒野行動'
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative h-[600px] w-80 mt-20">
        {[...visibleCards].reverse().map((card, index) => (
          <TinderCard
            key={`${card.userId}-${card.id}-${index}`}
            onSwipe={onSwipe}
            onCardLeftScreen={() => onCardLeftScreen(card.userId.toString())}
            preventSwipe={['up', 'down']}
            className="absolute left-0 right-0"
          >
            <div
              className={`select-none bg-white p-6 rounded-lg shadow-lg w-80 min-h-[400px] text-black ${
                index < currentIndex ? 'hidden' : 'block'
              }`}
            >
              <div className="mb-4">
                <PostAuthor userId={card.userId} />
              </div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="mt-2 mb-4 min-h-[60px] text-gray-700">{card.content}</p>
              <p className="text-xs text-gray-400 mb-4">
                {new Date(card.date || Date.now()).toLocaleString('ja-JP')}
              </p>
              <div className="flex justify-between mt-auto">
                <button 
                  onClick={() => handleLike(card)}
                  disabled={!isSignedIn || isLoading}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-full transition-all duration-200",
                    "hover:bg-red-50",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      hiddenPostIds.includes(card.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                    )}
                  />
                  <span className={cn(
                    "text-sm font-medium",
                    hiddenPostIds.includes(card.id) ? "text-red-500" : "text-gray-500"
                  )}>
                    いいね
                  </span>
                </button>
                <button 
                  onClick={() => onSwipe('left')}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-full transition-all duration-200",
                    "hover:bg-gray-100",
                    "text-gray-500"
                  )}
                >
                  <span className="text-sm font-medium">スキップ</span>
                </button>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>
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