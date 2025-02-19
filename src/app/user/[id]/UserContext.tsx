"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  statusMessage: string | null;
  avatarUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (!response.ok) throw new Error('プロフィールの取得に失敗しました');
      const { data } = await response.json();
      setProfile(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      toast.error('プロフィールの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, userId]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('プロフィールの更新に失敗しました');
      const { data: updatedProfile } = await response.json();
      setProfile(updatedProfile);
      toast.success('プロフィールを更新しました');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('プロフィールの更新に失敗しました');
      throw error;
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    await fetchProfile();
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        isLoading,
        error,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}