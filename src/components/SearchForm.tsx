"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [startDate, setStartDate] = useState(searchParams?.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams?.get('endDate') || '');
  const [followedOnly, setFollowedOnly] = useState(searchParams?.get('followedOnly') === 'true');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();

    // 各検索条件が存在する場合のみパラメータに追加
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (startDate) {
      params.set('startDate', startDate);
    }
    if (endDate) {
      params.set('endDate', endDate);
    }
    if (followedOnly) {
      params.set('followedOnly', 'true');
    }

    // 少なくとも1つの検索条件がある場合のみ検索を実行
    if (params.toString()) {
      router.push(`/search?${params.toString()}`);
    }
  };

  // 日付の範囲チェック
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      // 開始日が終了日より後の場合、終了日をリセット
      if (endDate && value > endDate) {
        setEndDate('');
      }
    } else {
      setEndDate(value);
      // 終了日が開始日より前の場合、開始日をリセット
      if (startDate && value < startDate) {
        setStartDate('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードを入力"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange('start', e.target.value)}
            max={endDate || undefined}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終了日
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange('end', e.target.value)}
            min={startDate || undefined}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="followedOnly"
          checked={followedOnly}
          onChange={(e) => setFollowedOnly(e.target.checked)}
          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="followedOnly" className="ml-2 text-sm text-gray-700">
          フォロー中のユーザーの投稿のみを表示
        </label>
      </div>
    </form>
  );
} 