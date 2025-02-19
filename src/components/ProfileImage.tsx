import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProfileImageProps {
  imageUrl: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfileImage = ({ imageUrl, size = 'md', className }: ProfileImageProps) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  return (
    <div className={cn(
      "relative group",
      sizeClasses[size],
      className
    )}>
      <div className={cn(
        "absolute inset-0 rounded-full",
        "bg-cyber-green/20 group-hover:bg-cyber-green/30",
        "transition-all duration-300",
        "animate-pulse"
      )} />
      
      <Image
        src={imageUrl}
        alt="アイコン画像"
        fill
        className={cn(
          "rounded-full object-cover z-10",
          "border-2 border-cyber-green group-hover:border-cyber-accent",
          "shadow-neon-green group-hover:shadow-neon-card",
          "transition-all duration-300",
          "group-hover:scale-105"
        )}
      />

      <div className={cn(
        "absolute inset-0 rounded-full z-20",
        "bg-gradient-to-r from-cyber-green/0 via-cyber-green/10 to-cyber-green/0",
        "opacity-0 group-hover:opacity-100",
        "transition-all duration-300",
        "animate-glow-line"
      )} />
    </div>
  );
};

export default ProfileImage;