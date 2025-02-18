"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import SearchForm from '@/components/SearchForm';
import { useUser } from '@clerk/nextjs';

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
}

interface SearchResponse {
  posts: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface DBUser {
  id: number;
  clerkId: string;
  username: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  statusMessage: string | null;
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const { user: clerkUser } = useUser();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<DBUser | null>(null);

  // データベースからユーザー情報を取得
  useEffect(() => {
    async function fetchUserData() {
      if (!clerkUser) return;

      try {
        const response = await fetch(`/api/user/${clerkUser.id}`);
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        const { data } = await response.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    }

    fetchUserData();
  }, [clerkUser]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryString = searchParams ? searchParams.toString() : '';
        const response = await fetch(`/api/search?${queryString}`);
        if (!response.ok) {
          throw new Error('検索に失敗しました');
        }
        const data = await response.json();
        
        // データが存在し、postsが配列の場合のみ処理
        if (data && Array.isArray(data.posts)) {
          const formattedData = {
            ...data,
            posts: data.posts.map((post: Post) => ({
              ...post,
              createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString()
            }))
          };
          setSearchResults(formattedData);
        } else {
          setSearchResults(null);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    // 検索パラメータが存在する場合のみ検索を実行
    if (searchParams && searchParams.toString()) {
      fetchResults();
    } else {
      setSearchResults(null);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">投稿を検索</h1>
        
        <SearchForm />

        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : searchResults ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                {searchResults.total}件の投稿が見つかりました
                （{searchResults.currentPage} / {searchResults.totalPages}ページ）
              </p>
              
              {searchResults.posts.length > 0 ? (
                <div className="grid gap-4">
                  {searchResults.posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        user: {
                          clerkId: post.userId,
                          username: post.username,
                          avatarUrl: post.avatarUrl,
                          imageUrl: post.imageUrl,
                          statusMessage: post.statusMessage
                        },
                        likes: []
                      }}
                      currentUserId={currentUser?.id || 0}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  検索条件に一致する投稿が見つかりませんでした
                </p>
              )}

              {searchResults.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: searchResults.totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
                        params.set('page', (i + 1).toString());
                        window.history.pushState({}, '', `?${params.toString()}`);
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        searchResults.currentPage === i + 1
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              検索キーワードを入力してください
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 