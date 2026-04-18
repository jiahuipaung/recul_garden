import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { PostData } from '../../utils/blogUtils';
import { blogTheme as t } from '../../styles/theme';

const Entry = styled.article`
  padding: 36px 0;
  border-bottom: 1px solid ${t.rule};

  &:last-of-type {
    border-bottom: none;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ${t.sans};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${t.muted};
  margin-bottom: 14px;
`;

const MetaDate = styled.span`
  color: ${t.muted};
`;

const MetaDivider = styled.span`
  color: ${t.subtle};
`;

const MetaTag = styled(Link)`
  color: ${t.accent};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: ${t.accentHover};
  }
`;

const TitleLink = styled(Link)`
  display: block;
  font-family: ${t.serif};
  font-size: 1.9rem;
  font-weight: 700;
  color: ${t.ink};
  line-height: 1.25;
  text-decoration: none;
  margin-bottom: 14px;

  &:hover {
    color: ${t.accent};
  }
`;

const Excerpt = styled.p`
  font-family: ${t.body_serif};
  font-size: 1rem;
  line-height: 1.8;
  color: ${t.body};
  margin: 0 0 18px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ContinueLink = styled(Link)`
  font-family: ${t.sans};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${t.accent};
  text-decoration: none;

  &:hover {
    color: ${t.accentHover};
  }
`;

interface PostPreviewProps {
  post: PostData;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const displayDate = post.date
    ? dayjs(post.date).format('MMMM D, YYYY').toUpperCase()
    : post.formattedDate;
  const primaryTag = post.tags[0];

  return (
    <Entry>
      <Meta>
        <MetaDate>{displayDate}</MetaDate>
        {primaryTag && (
          <>
            <MetaDivider>│</MetaDivider>
            <MetaTag to={`/blog/tags/${encodeURIComponent(primaryTag)}`}>
              {primaryTag}
            </MetaTag>
          </>
        )}
      </Meta>
      <TitleLink to={`/blog/${post.id}`}>{post.title}</TitleLink>
      {post.excerpt && <Excerpt>{post.excerpt}</Excerpt>}
      <ContinueLink to={`/blog/${post.id}`}>Continue reading →</ContinueLink>
    </Entry>
  );
};

export default PostPreview;
