"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const ProfileForm = () => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('プロフィールが更新されました:', name);
    } catch (error) {
      console.error('プロフィールの更新に失敗しました:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前を入力してください"
        className={cn(
          "w-full bg-cyber-darker border border-cyber-green rounded-lg",
          "px-4 py-2 text-cyber-green placeholder-cyber-green/50",
          "focus:outline-none focus:border-cyber-accent focus:shadow-neon-green",
          "transition-all duration-300"
        )}
      />
      <button
        type="submit"
        className={cn(
          "w-full bg-cyber-darker border border-cyber-green",
          "text-cyber-green font-cyber py-2 px-4 rounded-lg",
          "hover:bg-cyber-green hover:text-cyber-black",
          "focus:outline-none focus:shadow-neon-green",
          "transition-all duration-300",
          "animate-neon-pulse"
        )}
      >
        プロフィールを更新
      </button>
    </form>
  );
};

export default ProfileForm; 