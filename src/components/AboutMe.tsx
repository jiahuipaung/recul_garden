import React from 'react';
import styled from 'styled-components';
import { AiOutlineGithub, AiOutlineLinkedin } from 'react-icons/ai';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  height: 40px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const WindowControls = styled.div`
  display: flex;
  gap: 8px;
`;

const WindowButton = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  
  &:nth-child(1) { background-color: #ff5f56; }
  &:nth-child(2) { background-color: #ffbd2e; }
  &:nth-child(3) { background-color: #27c93f; }
`;

const ToolBar = styled.div`
  height: 50px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 20px;
`;

const ToolButton = styled.div`
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.5;
`;

const Content = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Title = styled.h1`
  font-size: 36px;
  margin-bottom: 16px;
  color: #333;
`;

const Subtitle = styled.h2`
  font-size: 24px;
  color: #666;
  margin-bottom: 32px;
`;

const Text = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 16px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 40px;
`;

const SocialLink = styled.a`
  color: #666;
  font-size: 24px;
  transition: color 0.2s;
  
  &:hover {
    color: #333;
  }
`;

interface AboutMeProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutMe: React.FC<AboutMeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <TopBar>
          <WindowControls>
            <WindowButton />
            <WindowButton />
            <WindowButton />
          </WindowControls>
        </TopBar>
        <ToolBar>
          <ToolButton>显示</ToolButton>
          <ToolButton>缩放</ToolButton>
          <ToolButton>插入</ToolButton>
          <ToolButton>表格</ToolButton>
          <ToolButton>图表</ToolButton>
          <ToolButton>文本</ToolButton>
          <ToolButton>形状</ToolButton>
          <ToolButton>媒体</ToolButton>
          <ToolButton>批注</ToolButton>
          <ToolButton>共享</ToolButton>
          <ToolButton>格式</ToolButton>
          <ToolButton>文稿</ToolButton>
        </ToolBar>
        <Content>
          <Title>Hi, Jiahui here</Title>
          <Subtitle>Welcome to my digital garden 🌱</Subtitle>
          <Text>
            My name is Jiahui Pang, a backend engineer based in Beijing or Macao
          </Text>
          <SocialLinks>
            <SocialLink href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
              <AiOutlineGithub />
            </SocialLink>
            <SocialLink href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
              <AiOutlineLinkedin />
            </SocialLink>
          </SocialLinks>
        </Content>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AboutMe; 