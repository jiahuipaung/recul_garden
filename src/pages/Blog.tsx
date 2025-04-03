import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import StatusBar from '../components/StatusBar';
import { getAllPosts, PostData } from '../utils/blogUtils';
import PostPreview from '../components/Blog/PostPreview';
import BlogSidebar from '../components/Blog/BlogSidebar';

const BlogContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
  padding-top: 4rem;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 0 2rem;
  max-width: 800px;
`;

const SidebarWrapper = styled.div`
  margin-right: 2rem;
`;

const BlogTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
`;

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取博客文章数据
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
        setError('Failed to load posts, please refresh the page');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <StatusBar />
      <BlogContainer>
        <SidebarWrapper>
          <BlogSidebar />
        </SidebarWrapper>
        <MainContent>
          <BlogTitle>Newest Posts</BlogTitle>
          {loading ? (
            <p>Loading posts...</p>
          ) : error ? (
            <p>{error}</p>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostPreview key={post.id} post={post} />)
          ) : (
            <p>No posts yet</p>
          )}
        </MainContent>
      </BlogContainer>
    </>
  );
};

export default Blog; 