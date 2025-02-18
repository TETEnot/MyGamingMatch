import { useState } from 'react';
import FollowList from './FollowList';

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
        className="text-sm hover:underline focus:outline-none"
      >
        <span className="font-bold">{followersCount}</span>
        <span className="text-gray-600 ml-1">フォロワー</span>
      </button>

      <button
        onClick={() => setShowFollowing(true)}
        className="text-sm hover:underline focus:outline-none"
      >
        <span className="font-bold">{followingCount}</span>
        <span className="text-gray-600 ml-1">フォロー中</span>
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