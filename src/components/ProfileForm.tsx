"use client";

import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前を入力してください"
        className="border p-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2">プロフィールを更新</button>
    </form>
  );
};

export default ProfileForm; 