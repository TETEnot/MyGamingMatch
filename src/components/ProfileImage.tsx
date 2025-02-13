import React from 'react';
import Image from 'next/image';

interface ProfileImageProps {
  imageUrl: string;
}

const ProfileImage = ({ imageUrl }: ProfileImageProps) => (
  <Image
    src={imageUrl} // S3のURLを指定
    alt="アイコン画像"
    width={32} // 適切なサイズに調整
    height={32} // 適切なサイズに調整
    className="rounded-full" // 丸く表示する場合
  />
);

export default ProfileImage;