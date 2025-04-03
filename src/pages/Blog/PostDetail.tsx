import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StatusBar from '../../components/StatusBar';
import { getPostData, PostData } from '../../utils/blogUtils';
import BlogSidebar from '../../components/Blog/BlogSidebar';

const PostContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
  padding-top: 4rem;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 2rem;
  max-width: 800px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const SidebarWrapper = styled.div`
  margin-right: 2rem;
`;

const PostTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const PostDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const PostContent = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #222;
  }
  
  h2 {
    font-size: 1.8rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  h3 {
    font-size: 1.5rem;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  a {
    color: #0078d7;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 1rem;
    margin-left: 0;
    color: #666;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 5px;
    overflow-x: auto;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }
  
  img {
    max-width: 100%;
    border-radius: 5px;
    margin: 1rem 0;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  padding: 2rem;
  text-align: center;
  background-color: #ffebee;
  border-radius: 5px;
`;

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const postData = await getPostData(id);
          setPost(postData);
        } catch (err) {
          console.error('Error loading post:', err);
          setError('Failed to load post');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id]);

  return (
    <>
      <StatusBar />
      <PostContainer>
        <SidebarWrapper>
          <BlogSidebar />
        </SidebarWrapper>
        <MainContent>
          {loading ? (
            <p>Loading post...</p>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : post ? (
            <>
              <PostTitle>{post.title}</PostTitle>
              <PostDate>{post.formattedDate}</PostDate>
              <PostContent>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </PostContent>
            </>
          ) : (
            <ErrorMessage>Post not found</ErrorMessage>
          )}
        </MainContent>
      </PostContainer>
    </>
  );
};

export default PostDetail; 