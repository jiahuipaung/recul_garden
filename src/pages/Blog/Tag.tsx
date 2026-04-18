import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPostsByTag } from '../../utils/blogUtils';
import PostPreview from '../../components/Blog/PostPreview';
import { blogTheme as t } from '../../styles/theme';

const Header = styled.div`
  margin-bottom: 12px;
`;

const Eyebrow = styled.div`
  font-family: ${t.sans};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${t.muted};
  margin-bottom: 8px;
`;

const TagName = styled.h1`
  font-family: ${t.serif};
  font-size: 2.4rem;
  font-weight: 700;
  color: ${t.ink};
  margin: 0 0 6px 0;
  text-transform: capitalize;
`;

const Count = styled.div`
  font-family: ${t.body_serif};
  font-size: 14px;
  color: ${t.muted};
`;

const Empty = styled.div`
  padding: 60px 0;
  text-align: center;
  font-family: ${t.body_serif};
  color: ${t.muted};

  a {
    color: ${t.accent};
    text-decoration: none;
    margin-left: 6px;
  }
`;

const Tag: React.FC = () => {
  const { tag = '' } = useParams();
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  return (
    <>
      <Header>
        <Eyebrow>Topic</Eyebrow>
        <TagName>{decoded}</TagName>
        <Count>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</Count>
      </Header>

      {posts.length > 0 ? (
        posts.map(post => <PostPreview key={post.id} post={post} />)
      ) : (
        <Empty>
          Nothing here yet under &ldquo;{decoded}&rdquo;.
          <Link to="/blog">← Back home</Link>
        </Empty>
      )}
    </>
  );
};

export default Tag;
