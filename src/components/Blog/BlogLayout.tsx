import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';
import { blogTheme as t } from '../../styles/theme';
import StatusBar from '../StatusBar';
import RightRail from './RightRail';

const Page = styled.div`
  min-height: 100vh;
  padding-top: 24px; /* reserve space for fixed StatusBar */
  background: ${t.bg};
  color: ${t.body};
  font-family: ${t.body_serif};
`;

const Masthead = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding: 60px 48px 24px 48px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 720px) {
    padding: 40px 20px 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const DesktopBack = styled(Link)`
  font-family: ${t.sans};
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${t.muted};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${t.accent};
  }
`;

const SiteTitle = styled(Link)`
  display: inline-block;
  font-family: ${t.serif};
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${t.ink};
  text-decoration: none;
  line-height: 1;

  @media (max-width: 720px) {
    font-size: 2.2rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 36px;
  padding: 28px 48px 20px 48px;
  border-bottom: 1px solid ${t.rule};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 720px) {
    padding: 18px 20px;
    gap: 20px;
  }
`;

const navLinkStyles = `
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
`;

const StyledNavLink = styled(NavLink)`
  ${navLinkStyles}
  color: ${t.muted};

  &:hover {
    color: ${t.ink};
  }

  &.active {
    color: ${t.accent};
    border-bottom-color: ${t.accent};
  }
`;

const NavSpacer = styled.span`
  flex: 1;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 64px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 48px 80px 48px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 48px;
    padding: 32px 20px 60px 20px;
  }
`;

const Main = styled.main`
  min-width: 0;
`;

const RailColumn = styled.div`
  position: sticky;
  top: 24px;

  @media (max-width: 960px) {
    position: static;
  }
`;

const BlogLayout: React.FC = () => {
  return (
    <Page>
      <StatusBar />

      <Masthead>
        <SiteTitle to="/blog">JAVEN&rsquo;S BLOG</SiteTitle>
        <DesktopBack to="/">← Back to Desktop</DesktopBack>
      </Masthead>

      <Nav>
        <StyledNavLink to="/blog" end>Home</StyledNavLink>
        <StyledNavLink to="/blog/tags/life">Life</StyledNavLink>
        <StyledNavLink to="/blog/tags/tech">Tech</StyledNavLink>
        <StyledNavLink to="/blog/archive">Archive</StyledNavLink>
        <NavSpacer />
        <StyledNavLink to="/blog/about">About</StyledNavLink>
      </Nav>

      <Layout>
        <Main>
          <Outlet />
        </Main>
        <RailColumn>
          <RightRail />
        </RailColumn>
      </Layout>
    </Page>
  );
};

export default BlogLayout;
