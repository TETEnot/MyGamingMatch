import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { XIcon, HeartIcon } from "@heroicons/react/solid";

const SwipeCard = ({ post, onRemove, isLiked, likeCount, handleLikeClick }) => {
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
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
      className="relative w-full max-w-sm bg-white rounded-lg shadow-lg p-4 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Image
            src={post.user.avatarUrl || "/default-avatar.png"}
            alt={post.user.username}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-2">
            <Link href={`/user/${post.user.clerkId}`} className="font-semibold hover:underline">
              {post.user.username}
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleBadClick}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleLikeClick}
            className={`transition-colors ${
              isLiked ? "text-pink-500" : "text-gray-500 hover:text-pink-500"
            }`}
          >
            <HeartIcon className="w-6 h-6" />
            <span className="text-sm ml-1">{likeCount}</span>
          </button>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-700">{post.content}</p>
      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt="Post image"
          width={300}
          height={200}
          className="mt-4 rounded-lg"
        />
      )}
    </motion.div>
  );
};

export default SwipeCard;
