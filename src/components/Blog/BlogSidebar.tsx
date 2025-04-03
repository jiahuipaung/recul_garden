import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SidebarContainer = styled(motion.aside)`
  width: 240px;
  padding: 2rem 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 2rem;
  height: fit-content;
`;

const SidebarTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  color: rgb(141, 142, 143);
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: block;
  padding: 0.75rem 1rem;
  color: ${props => props.$active ? '#0078d7' : '#333'};
  text-decoration: none;
  border-radius: 4px;
  background-color: ${props => props.$active ? 'rgba(0, 120, 215, 0.1)' : 'transparent'};
  font-weight: ${props => props.$active ? '500' : 'normal'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? 'rgba(0, 120, 215, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const BackToHome = styled(Link)`
  display: block;
  margin-top: 2rem;
  padding: 0.75rem 1rem;
  text-align: center;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  border: 1px solid #ddd;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333;
  }
`;

const BlogSidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <SidebarContainer
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SidebarTitle>Recul's Blog</SidebarTitle>
      <NavList>
        <NavItem>
          <NavLink to="/blog" $active={path === '/blog'}>
            Newest Posts
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/blog/archive" $active={path === '/blog/archive'}>
            Article Archive
          </NavLink>
        </NavItem>
      </NavList>
      <BackToHome to="/">Back to Home</BackToHome>
    </SidebarContainer>
  );
};

export default BlogSidebar; 