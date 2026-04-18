import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { PostData } from '../../utils/blogUtils';
import { blogTheme as t } from '../../styles/theme';

const YearSection = styled.section`
  margin-bottom: 40px;
`;

const YearHeading = styled.h2`
  font-family: ${t.serif};
  font-size: 2rem;
  font-weight: 700;
  color: ${t.ink};
  margin: 0 0 18px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${t.rule};
`;

const PostList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PostItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px dashed ${t.rule};

  &:last-child {
    border-bottom: none;
  }
`;

const PostLink = styled(Link)`
  font-family: ${t.body_serif};
  color: ${t.ink};
  text-decoration: none;
  font-size: 15px;
  line-height: 1.5;
  flex: 1;

  &:hover {
    color: ${t.accent};
  }
`;

const PostDate = styled.span`
  font-family: ${t.sans};
  color: ${t.muted};
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
`;

interface ArchiveItemProps {
  year: string;
  posts: PostData[];
}

const ArchiveItem: React.FC<ArchiveItemProps> = ({ year, posts }) => {
  return (
    <YearSection>
      <YearHeading>{year}</YearHeading>
      <PostList>
        {posts.map(post => (
          <PostItem key={post.id}>
            <PostLink to={`/blog/${post.id}`}>{post.title}</PostLink>
            <PostDate>
              {post.date ? dayjs(post.date).format('MMM D') : ''}
            </PostDate>
          </PostItem>
        ))}
      </PostList>
    </YearSection>
  );
};

export default ArchiveItem;
