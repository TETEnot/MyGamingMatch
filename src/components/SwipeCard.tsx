import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    imageUrl?: string;
    user: {
      clerkId: string;
      username: string;
      avatarUrl: string | null;
      imageUrl: string | null;
    };
    createdAt: string;
  };
  onRemove: (id: number) => void;
  isLiked: boolean;
  likeCount: number;
  handleLikeClick: () => void;
}

const SwipeCard = ({ post, onRemove, isLiked, likeCount, handleLikeClick }: SwipeCardProps) => {
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleSwipeLeft = async () => {
    try {
      const response = await fetch("/api/bads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) {
        throw new Error("バッドの作成に失敗しました");
      }

      onRemove(post.id);
    } catch (error) {
      console.error("Error creating bad:", error);
    }
  };

  const handleBadClick = async () => {
    await handleSwipeLeft();
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = swipePower(offset.x, velocity.x);
        if (swipe < -swipeConfidenceThreshold) {
          handleSwipeLeft();
        }
      }}
      className={cn(
        "relative w-full max-w-sm p-4 cursor-grab active:cursor-grabbing",
        "bg-cyber-darker border border-cyber-green rounded-lg",
        "shadow-neon-card transition-all duration-300",
        "hover:shadow-neon-green hover:border-cyber-accent"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="relative w-10 h-10">
            <Image
              src={post.user.avatarUrl || post.user.imageUrl || "/default-avatar.png"}
              alt={post.user.username}
              fill
              className="rounded-full border border-cyber-green shadow-neon-green"
            />
          </div>
          <div className="ml-2">
            <Link
              href={`/user/${post.user.clerkId}`}
              className="font-cyber text-cyber-green hover:text-cyber-accent hover:underline"
            >
              {post.user.username}
            </Link>
            <p className="text-sm text-cyber-green/70">
              {new Date(post.createdAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleLikeClick}
            className={cn(
              "flex items-center gap-2 p-2 rounded-full transition-all duration-200",
              "hover:bg-cyber-green/20",
              isLiked ? "text-cyber-accent" : "text-cyber-green/70"
            )}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-cyber-accent")} />
            <span className="text-sm">{likeCount}</span>
          </button>
          <button
            onClick={handleBadClick}
            className={cn(
              "flex items-center gap-2 p-2 rounded-full transition-all duration-200",
              "hover:bg-cyber-green/20 text-cyber-green/70"
            )}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <h2 className="text-xl font-cyber font-semibold mb-2 text-cyber-green animate-neon-pulse">
        {post.title}
      </h2>
      <p className="text-cyber-green/90">{post.content}</p>
      {post.imageUrl && (
        <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-cyber-green shadow-neon-card">
          <Image
            src={post.imageUrl}
            alt="投稿画像"
            fill
            className="object-cover"
          />
        </div>
      )}
    </motion.div>
  );
};

export default SwipeCard;
