import React from 'react';

interface Post {
  title: string;
  content: string;
  username: string;
}

const PostCard = ({ post }: { post: Post }) => {
  return (
    <div className="post-card">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <span>Posted by: {post.username}</span>
    </div>
  );
};

export default PostCard;