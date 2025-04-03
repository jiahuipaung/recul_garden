import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { PostData } from '../../utils/blogUtils';

interface PostPreviewProps {
  post: PostData;
}

const PostCard = styled(motion.article)`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const PostTitle = styled.h2`
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #0078d7;
    }
  }
`;

const PostDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const PostExcerpt = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 1rem;
`;

const ReadMore = styled(Link)`
  display: inline-block;
  font-size: 0.9rem;
  color:rgb(141, 142, 143);
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  return (
    <PostCard 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PostTitle>
        <Link to={`/blog/${post.id}`}>{post.title}</Link>
      </PostTitle>
      <PostDate>{post.formattedDate}</PostDate>
      <PostExcerpt>{post.excerpt}</PostExcerpt>
      <ReadMore to={`/blog/${post.id}`}>Read More →</ReadMore>
    </PostCard>
  );
};

export default PostPreview; 