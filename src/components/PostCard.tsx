import React from 'react';
import { useUserContext } from '../context/UserContext';

const PostCard = ({ post }: { post: any }) => {
  const { user } = useUserContext();

  return (
    <div className="post-card">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <span>Posted by: {user.username}</span>
    </div>
  );
};

export default PostCard;