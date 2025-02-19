"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PostCard from '@/components/PostCard';

interface UserProfileClientProps {
  id: string;
}

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

interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
    imageUrl: string | null;
  };
  isLiked: boolean;
}

export default function UserProfileClient({ id }: UserProfileClientProps) {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/user/${id}`);
        if (!response.ok) throw new Error('プロフィールの取得に失敗しました');
        const { data } = await response.json();
        setProfile(data);

        const postsResponse = await fetch(`/api/user/${id}/posts`);
        if (!postsResponse.ok) throw new Error('投稿の取得に失敗しました');
        const { data: postsData } = await postsResponse.json();
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('プロフィールの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [id, user]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    setIsFollowLoading(true);

    try {
      const response = await fetch(`/api/user/${id}/follow`, {
        method: profile.isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('フォロー操作に失敗しました');

      const { data } = await response.json();
      setProfile(prev => prev ? { ...prev, isFollowing: data.isFollowing, followersCount: data.followersCount } : null);
      toast.success(profile.isFollowing ? 'フォロー解除しました' : 'フォローしました');
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('フォロー操作に失敗しました');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className={cn(
        "flex justify-center items-center h-64",
        "bg-cyber-darker"
      )}>
        <Loader2 className={cn(
          "w-12 h-12 text-cyber-green",
          "animate-spin"
        )} />
      </div>
    );
  }

  return (
    <div className={cn(
      "max-w-2xl mx-auto",
      "space-y-8"
    )}>
      <div className={cn(
        "p-8 rounded-lg",
        "bg-cyber-black",
        "border border-cyber-green",
        "shadow-neon-card"
      )}>
        <div className="text-center">
          <div className="relative inline-block group">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={profile.avatarUrl || profile.imageUrl || '/default-avatar.png'}
                alt={profile.username}
                fill
                className={cn(
                  "rounded-full object-cover",
                  "border-2 border-cyber-green",
                  "shadow-neon-green",
                  "transition-all duration-300"
                )}
              />
            </div>
          </div>

          <h1 className={cn(
            "text-2xl font-cyber text-cyber-green mb-2",
            "animate-neon-pulse"
          )}>
            {profile.username}
          </h1>
          {profile.statusMessage && (
            <p className="text-cyber-green/80 font-cyber mb-4">
              {profile.statusMessage}
            </p>
          )}

          <div className={cn(
            "flex justify-center items-center gap-8 mb-6",
            "text-cyber-green font-cyber"
          )}>
            <div>
              <div className="text-xl">{profile.followersCount}</div>
              <div className="text-cyber-green/60">フォロワー</div>
            </div>
            <div>
              <div className="text-xl">{profile.followingCount}</div>
              <div className="text-cyber-green/60">フォロー中</div>
            </div>
          </div>

          {user?.id !== id && (
            <button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={cn(
                "px-6 py-2 rounded",
                "font-cyber",
                "flex items-center gap-2 mx-auto",
                "transition-colors duration-300",
                profile.isFollowing
                  ? "bg-cyber-darker border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-black"
                  : "bg-cyber-green text-cyber-black hover:bg-cyber-accent",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isFollowLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : profile.isFollowing ? (
                <UserMinus className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {profile.isFollowing ? 'フォロー中' : 'フォローする'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdated={(updatedPost: Post) => {
              setPosts(prev =>
                prev.map(p => p.id === updatedPost.id ? updatedPost : p)
              );
            }}
          />
        ))}
        {posts.length === 0 && (
          <div className={cn(
            "p-8 rounded-lg",
            "bg-cyber-black",
            "border border-cyber-green",
            "shadow-neon-card",
            "text-center"
          )}>
            <p className="text-cyber-green/80 font-cyber">
              投稿がありません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}