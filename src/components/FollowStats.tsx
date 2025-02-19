import { useState } from 'react';
import FollowList from './FollowList';
import { cn } from '@/lib/utils';

interface FollowStatsProps {
  userId: string;
  followersCount: number;
  followingCount: number;
}

export default function FollowStats({
  userId,
  followersCount,
  followingCount,
}: FollowStatsProps) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  return (
    <div className="flex space-x-6">
      <button
        onClick={() => setShowFollowers(true)}
        className={cn(
          "text-sm focus:outline-none",
          "text-cyber-green hover:text-cyber-accent",
          "transition-colors duration-300"
        )}
      >
        <span className="font-cyber animate-neon-pulse">{followersCount}</span>
        <span className="text-cyber-green/70 ml-1">フォロワー</span>
      </button>

      <button
        onClick={() => setShowFollowing(true)}
        className={cn(
          "text-sm focus:outline-none",
          "text-cyber-green hover:text-cyber-accent",
          "transition-colors duration-300"
        )}
      >
        <span className="font-cyber animate-neon-pulse">{followingCount}</span>
        <span className="text-cyber-green/70 ml-1">フォロー中</span>
      </button>

      <FollowList
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        userId={userId}
        type="followers"
        title="フォロワー"
      />

      <FollowList
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        userId={userId}
        type="following"
        title="フォロー中"
      />
    </div>
  );
} 