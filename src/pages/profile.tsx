"use client";

import { useUser } from '@clerk/nextjs';
import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import Image from 'next/image';

interface UnsafeMetadata {
  username?: string;
  statusMessage?: string;
  imageUrl?: string;
}

const ProfilePage = () => {
  const { user, isLoaded } = useUser();

  const [username, setUsername] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.unsafeMetadata as UnsafeMetadata;
      setUsername(metadata.username || '');
      setStatusMessage(metadata.statusMessage || '');
      setImageUrl(metadata.imageUrl || '');
    }
  }, [isLoaded, user]);

  const handleUpdate = async () => {
    if (user) {
      try {
        await user.update({
          unsafeMetadata: {
            username: username,
            statusMessage: statusMessage,
            imageUrl: imageUrl,
          },
        });
        console.log('User updated successfully');
        alert('プロフィールが更新されました');
        window.location.reload();
      } catch (error) {
        console.error('Error updating user:', error);
        alert('プロフィールの更新に失敗しました');
      }
    } else {
      console.error('User is not available');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (typeof data.url === 'string') {
          console.log('Uploaded Image URL:', data.url);
          setImageUrl(data.url);
        } else {
          console.error('Upload failed:', data.error);
        }
      } catch (error) {
        console.error('APIエラー:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-lg mt-8">
        <h1 className="text-2xl font-bold mb-4">プロフィール</h1>
        <div className="flex flex-col items-center">
          <Image
            src={imageUrl || '/default-avatar.png'}
            alt="Profile Icon"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full mb-4"
          />
          <input type="file" onChange={handleImageChange} className="mb-4" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
            className="mb-2 p-2 border rounded"
          />
          <textarea
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="ステータスメッセージ"
            className="mb-4 p-2 border rounded w-full"
          />
          <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded">
            保存
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;