import React from 'react';
import styled from 'styled-components';
import { getPostsByYear } from '../../utils/blogUtils';
import ArchiveItem from '../../components/Blog/ArchiveItem';
import { blogTheme as t } from '../../styles/theme';

const Header = styled.div`
  margin-bottom: 32px;
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

const Title = styled.h1`
  font-family: ${t.serif};
  font-size: 2.4rem;
  font-weight: 700;
  color: ${t.ink};
  margin: 0;
`;

const Empty = styled.p`
  color: ${t.muted};
  text-align: center;
  margin-top: 40px;
  font-family: ${t.body_serif};
`;

const Archive: React.FC = () => {
  const postsByYear = getPostsByYear();
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <>
      <Header>
        <Eyebrow>Every post, by year</Eyebrow>
        <Title>Archive</Title>
      </Header>
      {years.length > 0 ? (
        years.map(year => (
          <ArchiveItem key={year} year={year} posts={postsByYear[year]} />
        ))
      ) : (
        <Empty>No archive yet</Empty>
      )}
    </>
  );
};

export default Archive;
