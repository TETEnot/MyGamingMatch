"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { SignOutButton } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import * as Tabs from '@radix-ui/react-tabs';

interface ProfileClientProps {
  userId: string;
}

interface ServiceAccount {
  id: number;
  username: string;
  email: string;
  statusMessage: string | null;
  avatarUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export default function ProfileClient({ userId }: ProfileClientProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [serviceAccount, setServiceAccount] = useState<ServiceAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    statusMessage: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchServiceAccount();
    }
  }, [user]);

  useEffect(() => {
    if (serviceAccount) {
      setEditForm({
        username: serviceAccount.username,
        statusMessage: serviceAccount.statusMessage || '',
      });
    }
  }, [serviceAccount]);

  const fetchServiceAccount = async () => {
    try {
      const response = await fetch(`/api/profile?clerkId=${userId}`);
      if (response.ok) {
        const { data } = await response.json();
        console.log('Fetched service account data:', data);
        setServiceAccount(data);
      }
    } catch (error) {
      console.error('Error fetching service account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', editForm.username);
      formData.append('statusMessage', editForm.statusMessage);
      formData.append('clerkId', userId);
      if (selectedImage) {
        formData.append('avatar', selectedImage);
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      const { data } = await response.json();
      setServiceAccount(data);
      setIsEditing(false);
      toast.success('プロフィールを更新しました');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('プロフィールの更新に失敗しました');
    }
  };

  const getAvatarUrl = () => {
    console.log('Current avatar state:', {
      previewUrl,
      serviceAccountAvatar: serviceAccount?.avatarUrl,
      serviceAccountImage: serviceAccount?.imageUrl,
      userImage: user?.imageUrl
    });

    if (previewUrl) return previewUrl;
    if (serviceAccount?.avatarUrl) return serviceAccount.avatarUrl;
    if (serviceAccount?.imageUrl) return serviceAccount.imageUrl;
    if (user?.imageUrl) return user.imageUrl;
    return '/default-avatar.png';
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <Tabs.Root defaultValue="profile" className="w-full">
        <Tabs.List className="flex border-b mb-6" aria-label="プロフィールタブ">
          <Tabs.Trigger
            value="profile"
            className="px-4 py-2 -mb-px text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            プロフィール
          </Tabs.Trigger>
          <Tabs.Trigger
            value="auth"
            className="px-4 py-2 -mb-px text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            認証情報
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile" className="focus:outline-none">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20 group">
                  <div className="w-20 h-20 relative">
                    <Image
                      src={getAvatarUrl()}
                      alt="プロフィール画像"
                      width={80}
                      height={80}
                      priority
                      className="rounded-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    画像を変更
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="ユーザー名"
                    className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  />
                  <textarea
                    value={editForm.statusMessage}
                    onChange={(e) => setEditForm(prev => ({ ...prev, statusMessage: e.target.value }))}
                    placeholder="ステータスメッセージ"
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 resize-none"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <div className="w-20 h-20 relative">
                    <Image
                      src={getAvatarUrl()}
                      alt="プロフィール画像"
                      width={80}
                      height={80}
                      priority
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {serviceAccount?.username || user.fullName || 'ゲスト'}
                      </h1>
                      {serviceAccount?.statusMessage && (
                        <p className="text-gray-900">{serviceAccount.statusMessage}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-blue-500 hover:text-blue-600"
                    >
                      編集
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Tabs.Content>

        <Tabs.Content value="auth" className="focus:outline-none">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">登録済みメールアドレス</h2>
              <div className="space-y-2">
                {user.emailAddresses.map(email => (
                  <div key={email.id} className="flex items-center space-x-2">
                    <span className="text-gray-900">{email.emailAddress}</span>
                    {email.id === user.primaryEmailAddressId && (
                      <span className="text-xs bg-blue-100 text-gray-900 px-2 py-1 rounded">
                        メイン
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">連携済みアカウント</h2>
              <div className="space-y-3">
                {user.externalAccounts.map(account => (
                  <div key={account.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 relative">
                      {account.provider === 'google' && (
                        <Image
                          src="/google-icon.png"
                          alt="Google"
                          fill
                          className="object-contain"
                        />
                      )}
                      {account.provider === 'discord' && (
                        <Image
                          src="/discord-icon.png"
                          alt="Discord"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{account.provider}</p>
                      <p className="text-gray-900">{account.username || account.emailAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <SignOutButton>
                <button className="w-full px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                  ログアウト
                </button>
              </SignOutButton>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
} 