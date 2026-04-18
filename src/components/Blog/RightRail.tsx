import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { getTagCounts, getRecentPosts } from '../../utils/blogUtils';
import { blogTheme as t } from '../../styles/theme';

const Rail = styled.aside`
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 960px) {
    width: 100%;
    min-width: 0;
  }
`;

const Widget = styled.section<{ $accent: string }>`
  position: relative;
  background: #ffffff;
  border: 1px solid ${t.rule};
  border-radius: 6px;
  padding: 22px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

  &::before {
    content: '';
    position: absolute;
    top: 18px;
    left: 24px;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: ${p => p.$accent};
  }
`;

const WidgetTitle = styled.h3`
  font-family: ${t.sans};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${t.muted};
  margin: 0 0 14px 0;
  padding-left: 16px;
`;

const AboutName = styled.div`
  font-family: ${t.serif};
  font-size: 1.2rem;
  font-weight: 700;
  color: ${t.ink};
  margin-bottom: 6px;
`;

const AboutText = styled.p`
  font-family: ${t.body_serif};
  font-size: 13.5px;
  line-height: 1.65;
  color: ${t.body};
  margin: 0;
`;

const TopicsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  line-height: 1.5;
`;

const TopicLink = styled(Link)<{ $weight: number }>`
  font-family: ${t.body_serif};
  color: ${t.body};
  text-decoration: none;
  font-size: ${props => 0.85 + props.$weight * 0.25}rem;
  transition: color 0.15s;

  &:hover {
    color: ${t.accent};
  }
`;

const RecentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecentItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid ${t.rule};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const RecentLink = styled(Link)`
  display: block;
  font-family: ${t.body_serif};
  font-size: 14px;
  color: ${t.ink};
  text-decoration: none;
  line-height: 1.4;
  margin-bottom: 4px;

  &:hover {
    color: ${t.accent};
  }
`;

const RecentDate = styled.div`
  font-family: ${t.sans};
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${t.subtle};
`;

const RightRail: React.FC = () => {
  const tagCounts = getTagCounts();
  const recent = getRecentPosts(5);

  const maxCount = tagCounts[0]?.count || 1;
  const minCount = tagCounts[tagCounts.length - 1]?.count || 1;
  const range = Math.max(1, maxCount - minCount);
  const weightOf = (c: number) => (c - minCount) / range;

  return (
    <Rail>
      <Widget $accent="#c9a227">
        <WidgetTitle>About</WidgetTitle>
        <AboutName>Javen Pang</AboutName>
        <AboutText>
          Backend engineer based in Beijing & Macau. Writing about life, tech,
          and the occasional book that rearranges my head.
        </AboutText>
      </Widget>

      {tagCounts.length > 0 && (
        <Widget $accent="#4a7bd4">
          <WidgetTitle>Topics</WidgetTitle>
          <TopicsList>
            {tagCounts.map(({ tag, count }) => (
              <TopicLink
                key={tag}
                to={`/blog/tags/${encodeURIComponent(tag)}`}
                $weight={weightOf(count)}
              >
                {tag}
                <span style={{ color: t.subtle, fontSize: '0.75em', marginLeft: 2 }}>
                  ·{count}
                </span>
              </TopicLink>
            ))}
          </TopicsList>
        </Widget>
      )}

      {recent.length > 0 && (
        <Widget $accent="#5fb36a">
          <WidgetTitle>Recent Posts</WidgetTitle>
          <RecentList>
            {recent.map(post => (
              <RecentItem key={post.id}>
                <RecentLink to={`/blog/${post.id}`}>{post.title}</RecentLink>
                <RecentDate>
                  {post.date ? dayjs(post.date).format('MMM D, YYYY') : ''}
                </RecentDate>
              </RecentItem>
            ))}
          </RecentList>
        </Widget>
      )}
    </Rail>
  );
};

export default RightRail;
