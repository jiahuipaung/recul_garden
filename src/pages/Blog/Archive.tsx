import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import StatusBar from '../../components/StatusBar';
import { getPostsByYear, PostData } from '../../utils/blogUtils';
import BlogSidebar from '../../components/Blog/BlogSidebar';
import ArchiveItem from '../../components/Blog/ArchiveItem';

const ArchiveContainer = styled.div`
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

const ArchiveTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
`;

const Archive: React.FC = () => {
  const [postsByYear, setPostsByYear] = useState<Record<string, PostData[]>>({});
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        setLoading(true);
        const groupedPosts = await getPostsByYear();
        setPostsByYear(groupedPosts);
        
        // 获取年份并按降序排序
        const sortedYears = Object.keys(groupedPosts).sort((a, b) => Number(b) - Number(a));
        setYears(sortedYears);
      } catch (error) {
        console.error('Error loading archive:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, []);

  return (
    <>
      <StatusBar />
      <ArchiveContainer>
        <SidebarWrapper>
          <BlogSidebar />
        </SidebarWrapper>
        <MainContent>
          <ArchiveTitle>Article Archive</ArchiveTitle>
          {loading ? (
            <p>Loading archive...</p>
          ) : years.length > 0 ? (
            years.map((year) => (
              <ArchiveItem key={year} year={year} posts={postsByYear[year]} />
            ))
          ) : (
            <p>No archive yet</p>
          )}
        </MainContent>
      </ArchiveContainer>
    </>
  );
};

export default Archive; 