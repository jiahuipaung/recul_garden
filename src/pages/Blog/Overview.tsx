import React from 'react';
import { getAllPosts } from '../../utils/blogUtils';
import PostPreview from '../../components/Blog/PostPreview';

const Overview: React.FC = () => {
  const posts = getAllPosts();

  return (
    <>
      {posts.map(post => (
        <PostPreview key={post.id} post={post} />
      ))}
    </>
  );
};

export default Overview;
