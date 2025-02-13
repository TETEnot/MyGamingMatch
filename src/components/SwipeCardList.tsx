"use client";

import React, { useState } from 'react';
import TinderCard from 'react-tinder-card';
import { useUser } from '@clerk/nextjs';

interface Card {
  name: string;
  game: string;
  description: string;
  date: string;
}

const SwipeCardList = ({ cards, setCards }: { cards: Card[]; setCards: React.Dispatch<React.SetStateAction<Card[]>> }) => {
  const { isSignedIn, user } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newCard, setNewCard] = useState({ game: '', description: '' });

  const onSwipe = (direction: string) => {
    console.log('あなたはスワイプしました: ' + direction);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const onCardLeftScreen = (myIdentifier: string) => {
    console.log(myIdentifier + ' が画面から消えました');
  };

  const handleAddNewCard = async () => {
    try {
      const response = await fetch('/api/example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: user?.fullName || '匿名', ...newCard, date: new Date().toISOString().split('T')[0] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Post added:', data);
      setCards((prevCards) => [...prevCards, data]);
      setShowForm(false);
      setNewCard({ game: '', description: '' });
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const gameOptions = [
    'APEX', 'Fortnite', '原神', 'Maincraft', 'VALORANT',
    'MARVEL Rivals', 'MARVEL SNAP', 'モンスターストライク', 'ブロスタ', '荒野行動'
  ];

  return (
    <div className="flex justify-center items-center relative mb-64 mr-64">
      {cards.map((card, index) => (
        <TinderCard
          key={`${card.name}-${card.date}-${index}`}
          onSwipe={onSwipe}
          onCardLeftScreen={() => onCardLeftScreen(card.name)}
          preventSwipe={['up', 'down']}
        >
          <div
            className={`absolute select-none bg-white p-6 rounded-lg shadow-lg w-80 text-black transition-transform duration-300 ${
              index < currentIndex ? 'hidden' : 'block'
            }`}
            style={{ zIndex: cards.length - index, left: '-20px' }}
          >
            <h2 className="text-xl font-bold">{card.name}</h2>
            <p className="text-sm text-gray-500">{card.game}</p>
            <p className="mt-2">{card.description}</p>
            <p className="text-xs text-gray-400 mt-4">{card.date}</p>
            <div className="flex justify-between mt-4">
              <button className="bg-green-500 text-white px-4 py-2 rounded">いいね</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded">バッド</button>
            </div>
          </div>
        </TinderCard>
      ))}
      {isSignedIn && (
        <>
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-8 right-8 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
          >
            新規投稿
          </button>
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-xl font-bold mb-4 text-black">新しい投稿</h2>
                <select
                  value={newCard.game}
                  onChange={(e) => setNewCard({ ...newCard, game: e.target.value })}
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
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  className="border p-2 mb-2 w-full text-gray-700"
                />
                <button
                  onClick={handleAddNewCard}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full"
                >
                  投稿
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SwipeCardList;