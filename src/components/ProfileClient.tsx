"use client";

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from './Header';

interface ProfileClientProps {
  userId: string;
}

export default function ProfileClient({ userId }: ProfileClientProps) {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('/default-avatar.png');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch(`/api/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        
        const { data } = await response.json();
        
        if (!data) {
          throw new Error('ユーザーデータが見つかりません');
        }

        setUsername(data.username || user.fullName || '');
        setStatusMessage(data.statusMessage || '');
        setImageUrl(data.avatarUrl || data.imageUrl || user.imageUrl || '/default-avatar.png');
        setError(null);
      } catch (error) {
        setError('プロフィール情報を読み込めませんでした。');
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserData();
  }, [userId, user, isLoaded]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          username,
          statusMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'プロフィールの更新に失敗しました');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'プロフィールの更新中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-red-500 text-center">
          <p>エラーが発生しました: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">プロフィール設定</h1>
      
      <div className="flex items-center mb-6">
        <div className="relative w-24 h-24 mr-6">
          <Image
            src={imageUrl}
            alt="プロフィール画像"
            fill
            className="rounded-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">ステータスメッセージ</label>
                <textarea
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSaving}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{username}</h2>
                <p className="text-gray-600">{statusMessage || 'ステータスメッセージを設定してください'}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                編集
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 