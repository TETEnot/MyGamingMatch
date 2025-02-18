import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  className?: string;
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing = false,
  className
}: FollowButtonProps) {
  const { isSignedIn, user } = useUser();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    async function checkFollowStatus() {
      try {
        const response = await fetch(`/api/follow/status?targetUserId=${targetUserId}`);
        if (response.ok) {
          const { isFollowing } = await response.json();
          setIsFollowing(isFollowing);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    }

    checkFollowStatus();
  }, [targetUserId, user, isSignedIn]);

  const handleFollow = async () => {
    if (!isSignedIn || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const error = await response.json();
        console.error('フォローの操作に失敗しました:', error);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={!isSignedIn || isLoading || (user?.id === targetUserId)}
      className={cn(
        "px-4 py-1 rounded-full text-sm font-medium transition-all duration-200",
        isFollowing
          ? "bg-gray-200 text-gray-800 hover:bg-red-50 hover:text-red-500"
          : "bg-blue-500 text-white hover:bg-blue-600",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isFollowing ? 'フォロー中' : 'フォローする'}
    </button>
  );
} 