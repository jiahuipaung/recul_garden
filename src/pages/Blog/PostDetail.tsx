import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostById, getAdjacentPosts } from '../../utils/blogUtils';
import { blogTheme as t } from '../../styles/theme';

const Article = styled.article`
  max-width: 720px;
`;

const Header = styled.header`
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${t.rule};
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ${t.sans};
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${t.muted};
  margin-bottom: 18px;
`;

const MetaDivider = styled.span`
  color: ${t.subtle};
`;

const MetaTag = styled(Link)`
  color: ${t.accent};
  text-decoration: none;
  font-weight: 700;

  &:hover {
    color: ${t.accentHover};
  }
`;

const PostTitle = styled.h1`
  font-family: ${t.serif};
  font-size: 2.6rem;
  font-weight: 700;
  color: ${t.ink};
  line-height: 1.2;
  margin: 0 0 8px 0;
`;

const ReadingTime = styled.div`
  font-family: ${t.body_serif};
  font-size: 13px;
  color: ${t.muted};
`;

const PostContent = styled.div`
  font-family: ${t.body_serif};
  font-size: 1.05rem;
  line-height: 1.85;
  color: ${t.body};

  h1, h2, h3, h4, h5, h6 {
    font-family: ${t.serif};
    margin-top: 2.2rem;
    margin-bottom: 0.9rem;
    color: ${t.ink};
    scroll-margin-top: 24px;
    line-height: 1.3;
  }

  h1 { font-size: 1.9rem; }
  h2 {
    font-size: 1.6rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid ${t.rule};
  }
  h3 { font-size: 1.3rem; }

  p {
    margin: 0 0 1.3rem 0;
  }

  a {
    color: ${t.accent};
    text-decoration: none;
    border-bottom: 1px solid ${t.rule};

    &:hover {
      border-bottom-color: ${t.accent};
    }
  }

  blockquote {
    border-left: 3px solid ${t.accent};
    padding: 4px 0 4px 20px;
    margin: 1.4rem 0;
    color: ${t.muted};
    font-style: italic;
  }

  code {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    background-color: #f6f6f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.88em;
  }

  pre {
    background-color: #f6f6f4;
    padding: 18px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1.3rem 0;
    border: 1px solid ${t.rule};

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  ul, ol {
    margin: 0 0 1.3rem 0;
    padding-left: 1.6rem;
  }

  li {
    margin-bottom: 0.4rem;
  }

  img {
    max-width: 100%;
    margin: 1.4rem 0;
  }

  strong {
    font-weight: 700;
    color: ${t.ink};
  }

  hr {
    border: none;
    border-top: 1px solid ${t.rule};
    margin: 2rem 0;
  }
`;

const Footer = styled.footer`
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid ${t.rule};
  display: flex;
  justify-content: space-between;
  gap: 16px;
  max-width: 720px;
`;

const NavCell = styled(Link)<{ $align: 'left' | 'right' }>`
  flex: 1;
  text-decoration: none;
  text-align: ${p => p.$align};
  color: ${t.body};

  &:hover h4 {
    color: ${t.accent};
  }
`;

const NavLabel = styled.div`
  font-family: ${t.sans};
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${t.muted};
  margin-bottom: 6px;
`;

const NavTitle = styled.h4`
  font-family: ${t.serif};
  font-size: 1.05rem;
  font-weight: 700;
  color: ${t.ink};
  margin: 0;
  line-height: 1.4;
  transition: color 0.15s;
`;

const NotFound = styled.div`
  padding: 80px 0;
  text-align: center;
  color: ${t.muted};
  font-family: ${t.body_serif};
`;

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getHeadingText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  return React.Children.toArray(children)
    .map(c => (typeof c === 'string' ? c : ''))
    .join('');
}

const H1 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 id={headingId(getHeadingText(children))} {...props}>{children}</h1>
);
const H2 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 id={headingId(getHeadingText(children))} {...props}>{children}</h2>
);
const H3 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 id={headingId(getHeadingText(children))} {...props}>{children}</h3>
);

const markdownComponents = { h1: H1, h2: H2, h3: H3 };

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const post = id ? getPostById(id) : undefined;
  const { prev, next } = id ? getAdjacentPosts(id) : {};

  if (!post) {
    return <NotFound>Post not found</NotFound>;
  }

  const displayDate = post.date
    ? dayjs(post.date).format('MMMM D, YYYY').toUpperCase()
    : post.formattedDate;
  const primaryTag = post.tags[0];

  return (
    <Article>
      <Header>
        <Meta>
          <span>{displayDate}</span>
          {primaryTag && (
            <>
              <MetaDivider>│</MetaDivider>
              <MetaTag to={`/blog/tags/${encodeURIComponent(primaryTag)}`}>
                {primaryTag}
              </MetaTag>
            </>
          )}
        </Meta>
        <PostTitle>{post.title}</PostTitle>
        <ReadingTime>{post.readingTime} min read</ReadingTime>
      </Header>

      <PostContent>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {post.content}
        </ReactMarkdown>
      </PostContent>

      {(prev || next) && (
        <Footer>
          {prev ? (
            <NavCell to={`/blog/${prev.id}`} $align="left">
              <NavLabel>← Previous</NavLabel>
              <NavTitle>{prev.title}</NavTitle>
            </NavCell>
          ) : <div style={{ flex: 1 }} />}
          {next ? (
            <NavCell to={`/blog/${next.id}`} $align="right">
              <NavLabel>Next →</NavLabel>
              <NavTitle>{next.title}</NavTitle>
            </NavCell>
          ) : <div style={{ flex: 1 }} />}
        </Footer>
      )}
    </Article>
  );
};

export default PostDetail;
