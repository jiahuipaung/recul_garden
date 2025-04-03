import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { PostData } from '../../utils/blogUtils';

interface ArchiveItemProps {
  year: string;
  posts: PostData[];
}

const YearSection = styled(motion.section)`
  margin-bottom: 2rem;
`;

const YearHeading = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const PostList = styled.ul`
  list-style: none;
  padding: 0;
`;

const PostItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.75rem 0;
  border-bottom: 1px dashed #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PostLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s;
  
  &:hover {
    color: #0078d7;
  }
`;

const PostDate = styled.span`
  color: #666;
  font-size: 0.85rem;
`;

const ArchiveItem: React.FC<ArchiveItemProps> = ({ year, posts }) => {
  return (
    <YearSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <YearHeading>{year} Year</YearHeading>
      <PostList>
        {posts.map((post) => (
          <PostItem
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <PostLink to={`/blog/${post.id}`}>{post.title}</PostLink>
            <PostDate>{post.formattedDate.split('-')[1]}</PostDate>
          </PostItem>
        ))}
      </PostList>
    </YearSection>
  );
};

export default ArchiveItem; 