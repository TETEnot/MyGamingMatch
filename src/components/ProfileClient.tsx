"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Camera, Save, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
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
  const router = useRouter();
  const [serviceAccount, setServiceAccount] = useState<ServiceAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchServiceAccount = async () => {
      try {
        const response = await fetch(`/api/profile?clerkId=${userId}`);
        if (!response.ok) throw new Error('プロフィールの取得に失敗しました');
        const { data } = await response.json();
        setServiceAccount(data);
        setUsername(data.username || '');
        setStatusMessage(data.statusMessage || '');
      } catch (error) {
        console.error('Error fetching service account:', error);
      }
    };

    fetchServiceAccount();
  }, [userId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('clerkId', userId);
      formData.append('username', username);
      formData.append('statusMessage', statusMessage);
      if (selectedImage) {
        formData.append('avatar', selectedImage);
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('プロフィールの更新に失敗しました');

      const { data } = await response.json();
      setServiceAccount(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!serviceAccount) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={cn(
          "w-12 h-12 border-2 border-cyber-green rounded-full",
          "border-t-transparent animate-spin"
        )} />
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue="profile" className={cn(
      "max-w-2xl mx-auto",
      "bg-cyber-darker rounded-lg",
      "border border-cyber-green",
      "shadow-neon-card",
      "p-8"
    )}>
      <Tabs.List className={cn(
        "flex space-x-4 mb-8",
        "border-b border-cyber-green/30"
      )}>
        <Tabs.Trigger
          value="profile"
          className={cn(
            "px-4 py-2",
            "font-cyber text-cyber-green",
            "border-b-2 border-transparent",
            "data-[state=active]:border-cyber-green",
            "data-[state=active]:text-cyber-accent",
            "hover:text-cyber-accent",
            "transition-colors duration-300"
          )}
        >
          プロフィール
        </Tabs.Trigger>
        <Tabs.Trigger
          value="auth"
          className={cn(
            "px-4 py-2",
            "font-cyber text-cyber-green",
            "border-b-2 border-transparent",
            "data-[state=active]:border-cyber-green",
            "data-[state=active]:text-cyber-accent",
            "hover:text-cyber-accent",
            "transition-colors duration-300"
          )}
        >
          認証情報
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="profile" className="space-y-8">
        <div className="text-center">
          <div className="relative inline-block group">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={previewUrl || serviceAccount.avatarUrl || serviceAccount.imageUrl || '/default-avatar.png'}
                alt={username}
                fill
                className={cn(
                  "rounded-full object-cover",
                  "border-2 border-cyber-green group-hover:border-cyber-accent",
                  "shadow-neon-green group-hover:shadow-neon-card",
                  "transition-all duration-300"
                )}
              />
              {isEditing && (
                <label className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-cyber-black/50 rounded-full cursor-pointer",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300"
                )}>
                  <Camera className="w-8 h-8 text-cyber-green" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名"
                  className={cn(
                    "w-full px-4 py-2",
                    "bg-cyber-black",
                    "border border-cyber-green rounded",
                    "text-cyber-green font-cyber text-center",
                    "focus:outline-none focus:border-cyber-accent",
                    "placeholder:text-cyber-green/50"
                  )}
                />
              </div>
              <div>
                <textarea
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="ステータスメッセージ"
                  className={cn(
                    "w-full px-4 py-2",
                    "bg-cyber-black",
                    "border border-cyber-green rounded",
                    "text-cyber-green font-cyber text-center",
                    "focus:outline-none focus:border-cyber-accent",
                    "placeholder:text-cyber-green/50",
                    "resize-none"
                  )}
                  rows={3}
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "px-6 py-2 rounded",
                    "bg-cyber-green text-cyber-black",
                    "font-cyber",
                    "flex items-center gap-2",
                    "hover:bg-cyber-accent",
                    "transition-colors duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={cn(
                    "px-6 py-2 rounded",
                    "bg-cyber-darker",
                    "border border-cyber-green",
                    "text-cyber-green",
                    "font-cyber",
                    "hover:bg-cyber-green hover:text-cyber-black",
                    "transition-colors duration-300"
                  )}
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className={cn(
                "text-2xl font-cyber text-cyber-green mb-2",
                "animate-neon-pulse"
              )}>
                {serviceAccount.username}
              </h1>
              {serviceAccount.statusMessage && (
                <p className="text-cyber-green/80 font-cyber mb-4">
                  {serviceAccount.statusMessage}
                </p>
              )}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    "px-6 py-2 rounded",
                    "bg-cyber-darker",
                    "border border-cyber-green",
                    "text-cyber-green",
                    "font-cyber",
                    "hover:bg-cyber-green hover:text-cyber-black",
                    "transition-colors duration-300"
                  )}
                >
                  プロフィールを編集
                </button>
              </div>
            </>
          )}
        </div>
      </Tabs.Content>

      <Tabs.Content value="auth" className="space-y-8">
        <div className={cn(
          "p-6 rounded-lg",
          "bg-cyber-black",
          "border border-cyber-green",
          "shadow-neon-card"
        )}>
          <h2 className="text-xl font-cyber text-cyber-green mb-4">
            登録済みメールアドレス
          </h2>
          <p className="text-cyber-green/70 font-cyber">
            {serviceAccount.email}
          </p>
        </div>

        <div className={cn(
          "p-6 rounded-lg",
          "bg-cyber-black",
          "border border-cyber-green",
          "shadow-neon-card"
        )}>
          <h2 className="text-xl font-cyber text-cyber-green mb-4">
            アカウント管理
          </h2>
          <SignOutButton>
            <button className={cn(
              "px-6 py-2 rounded",
              "bg-cyber-darker",
              "border border-cyber-green",
              "text-cyber-green",
              "font-cyber",
              "flex items-center gap-2",
              "hover:bg-cyber-green hover:text-cyber-black",
              "transition-colors duration-300"
            )}>
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </SignOutButton>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
} 