"use client";

import { SignInButton, SignOutButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function AuthButtons() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    async function syncUserData() {
      if (!isSignedIn || !user) return;

      try {
        const existingDataResponse = await fetch(`/api/profile?clerkId=${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.id}`,
          },
        });

        let existingData = null;
        if (existingDataResponse.ok) {
          const { data } = await existingDataResponse.json();
          existingData = data;
        }

        const userData = {
          clerkId: user.id,
          username: existingData?.username || user.fullName || 'ゲスト',
          email: user.primaryEmailAddress?.emailAddress || '',
          imageUrl: existingData?.avatarUrl || existingData?.imageUrl || user.imageUrl,
          statusMessage: existingData?.statusMessage || '',
        };

        console.log('AuthButtons: Syncing user data:', userData);
        const response = await fetch('/api/saveUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || 'ユーザー情報の同期に失敗しました');
        }

        const { data } = await response.json();
        console.log('AuthButtons: User data synced successfully:', data);
      } catch (error) {
        console.error('AuthButtons: Error syncing user data:', error);
      }
    }

    syncUserData();
  }, [isSignedIn, user]);

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <SignOutButton>
          <button className={cn(
            "px-4 py-2 rounded-lg",
            "bg-cyber-darker border border-cyber-green",
            "text-cyber-green hover:text-cyber-accent",
            "hover:shadow-neon-green transition-all duration-300"
          )}>
            ログアウト
          </button>
        </SignOutButton>
      ) : (
        <div className="flex gap-2">
          <SignInButton>
            <button className={cn(
              "px-4 py-2 rounded-lg",
              "bg-cyber-green text-cyber-black",
              "hover:bg-cyber-accent transition-colors",
              "shadow-neon-green"
            )}>
              ログイン
            </button>
          </SignInButton>
          <SignUpButton>
            <button className={cn(
              "px-4 py-2 rounded-lg",
              "bg-cyber-darker border border-cyber-green",
              "text-cyber-green hover:text-cyber-accent",
              "hover:shadow-neon-green transition-all duration-300"
            )}>
              新規登録
            </button>
          </SignUpButton>
        </div>
      )}
    </div>
  );
}