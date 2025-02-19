"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    router.push(`/search?${params.toString()}`);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      if (endDate && new Date(value) > new Date(endDate)) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
      if (startDate && new Date(value) < new Date(startDate)) {
        setStartDate(value);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="投稿を検索..."
          className={cn(
            "w-full bg-cyber-darker border border-cyber-green rounded-lg",
            "pl-10 pr-4 py-2 text-cyber-green placeholder-cyber-green/50",
            "focus:outline-none focus:border-cyber-accent focus:shadow-neon-green",
            "transition-all duration-300"
          )}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-green/50" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-cyber-green text-sm mb-1">開始日</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className={cn(
              "w-full bg-cyber-darker border border-cyber-green rounded-lg",
              "px-4 py-2 text-cyber-green",
              "focus:outline-none focus:border-cyber-accent focus:shadow-neon-green",
              "transition-all duration-300"
            )}
          />
        </div>
        <div>
          <label className="block text-cyber-green text-sm mb-1">終了日</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className={cn(
              "w-full bg-cyber-darker border border-cyber-green rounded-lg",
              "px-4 py-2 text-cyber-green",
              "focus:outline-none focus:border-cyber-accent focus:shadow-neon-green",
              "transition-all duration-300"
            )}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="followedOnly"
          checked={followedOnly}
          onChange={(e) => setFollowedOnly(e.target.checked)}
          className={cn(
            "mr-2 w-4 h-4 text-cyber-green bg-cyber-darker border-cyber-green",
            "focus:ring-cyber-accent focus:ring-2"
          )}
        />
        <label htmlFor="followedOnly" className="text-cyber-green">
          フォロー中のユーザーの投稿のみ表示
        </label>
      </div>

      <button
        type="submit"
        className={cn(
          "w-full bg-cyber-darker border border-cyber-green",
          "text-cyber-green font-cyber py-2 px-4 rounded-lg",
          "hover:bg-cyber-green hover:text-cyber-black",
          "focus:outline-none focus:shadow-neon-green",
          "transition-all duration-300",
          "animate-neon-pulse"
        )}
      >
        検索
      </button>
    </form>
  );
} 