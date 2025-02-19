"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, Calendar, Search, Filter } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { toast } from 'react-hot-toast';

interface Post {
  id: number;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  username: string;
  avatarUrl?: string;
  imageUrl?: string;
  statusMessage?: string;
  likeCount: number;
  isLiked: boolean;
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
    imageUrl: string | null;
  };
  likes: any[];
}

interface SearchResponse {
  posts: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function SearchClient({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [followedOnly, setFollowedOnly] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const query = searchParams?.get('q') || '';
        const params = new URLSearchParams({
          q: query,
          page: currentPage.toString(),
          ...(dateRange.start && { startDate: dateRange.start }),
          ...(dateRange.end && { endDate: dateRange.end }),
          followedOnly: followedOnly.toString(),
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) throw new Error('検索に失敗しました');

        const data: SearchResponse = await response.json();
        const processedPosts = data.posts.map(post => {
          try {
            const date = new Date(post.createdAt);
            if (isNaN(date.getTime())) {
              console.warn('無効な日付形式です:', post.createdAt);
              return {
                ...post,
                createdAt: new Date().toISOString(),
                user: {
                  id: parseInt(post.userId),
                  username: post.username,
                  avatarUrl: post.avatarUrl || null,
                  imageUrl: post.imageUrl || null,
                },
                likes: []
              };
            }
            return {
              ...post,
              createdAt: date.toISOString(),
              user: {
                id: parseInt(post.userId),
                username: post.username,
                avatarUrl: post.avatarUrl || null,
                imageUrl: post.imageUrl || null,
              },
              likes: []
            };
          } catch (error) {
            console.error('日付の処理中にエラーが発生しました:', error);
            return {
              ...post,
              createdAt: new Date().toISOString(),
              user: {
                id: parseInt(post.userId),
                username: post.username,
                avatarUrl: post.avatarUrl || null,
                imageUrl: post.imageUrl || null,
              },
              likes: []
            };
          }
        });

        setPosts(processedPosts);
        setError(null);
      } catch (error) {
        console.error('Search error:', error);
        setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
        toast.error('検索に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, currentPage, dateRange, followedOnly]);

  if (error) {
    return (
      <div className={cn(
        "p-8 rounded-lg",
        "bg-cyber-black",
        "border border-cyber-red",
        "shadow-neon-red",
        "text-center"
      )}>
        <p className="text-cyber-red/80 font-cyber">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={cn(
        "p-6 rounded-lg",
        "bg-cyber-black",
        "border border-cyber-green",
        "shadow-neon-card"
      )}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-cyber-green/80 font-cyber mb-2">
              日付範囲
            </label>
            <div className="flex gap-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className={cn(
                  "flex-1 px-4 py-2 rounded",
                  "bg-cyber-darker",
                  "border border-cyber-green",
                  "text-cyber-green font-cyber",
                  "focus:outline-none focus:border-cyber-accent",
                  "placeholder:text-cyber-green/50"
                )}
              />
              <span className="text-cyber-green self-center">〜</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={cn(
                  "flex-1 px-4 py-2 rounded",
                  "bg-cyber-darker",
                  "border border-cyber-green",
                  "text-cyber-green font-cyber",
                  "focus:outline-none focus:border-cyber-accent",
                  "placeholder:text-cyber-green/50"
                )}
              />
            </div>
          </div>
          <div className="flex items-end">
            <label className={cn(
              "flex items-center gap-2",
              "text-cyber-green font-cyber"
            )}>
              <input
                type="checkbox"
                checked={followedOnly}
                onChange={(e) => setFollowedOnly(e.target.checked)}
                className={cn(
                  "w-4 h-4",
                  "bg-cyber-darker",
                  "border border-cyber-green",
                  "text-cyber-green",
                  "rounded",
                  "focus:ring-cyber-accent"
                )}
              />
              フォロー中のユーザーのみ
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className={cn(
              "w-8 h-8 text-cyber-green",
              "animate-spin"
            )} />
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))
        ) : (
          <div className={cn(
            "p-8 rounded-lg",
            "bg-cyber-black",
            "border border-cyber-green",
            "shadow-neon-card",
            "text-center"
          )}>
            <p className="text-cyber-green/80 font-cyber">
              投稿が見つかりません
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 