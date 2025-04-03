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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TopBar = styled.div`
  height: 28px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 12px;
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

const Content = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: white;
`;

const Title = styled.h1`
  font-size: 36px;
  margin-bottom: 10px;
  color: #333;
  font-weight: 600;
`;

const Subtitle = styled.h2`
  font-size: 24px;
  color: #666;
  margin-bottom: 15px;
  font-weight: normal;
`;

const Text = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 10px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 15px;
  justify-content: flex-start;
`;

const SocialLink = styled.a`
  color: #666;
  font-size: 24px;
  transition: color 0.2s;
  
  &:hover {
    color: #333;
  }
`;

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutMeModal: React.FC<AboutMeModalProps> = ({ isOpen, onClose }) => {
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
        <Content>
          <Title>Hi, Jiahui here</Title>
          <Subtitle>Welcome to my digital garden 🌱</Subtitle>
          <Text>
            My name is Jiahui Pang, a backend engineer based in Beijing🇨🇳 or Macao🇲🇴
          </Text>
          <Text>
          It is hard to introduce oneself, and it probably means that people will describe a person who they want to establish.
          </Text>
          <Text>
            So, who am I? I can only list a few basics to help you understand me better.
          </Text>
          <Subtitle>Experience 💼</Subtitle>
          <Text>
            Master of Science in Computer Science @UM, 2025.08 - Present
          </Text>
          <Text>
            Software Engineer @tp-link, 2023.07 - 2025.03
          </Text>
          <Text>
            Bachelor of Science in Automation @HUST, 2019.09 - 2023.06
          </Text>
          <Subtitle>Personal Tags 📝</Subtitle>
          <Text>
            Programmer, Reading, American/Enlish/Japanese/Korean drama
          </Text>
          <Text>
            C/C++, Python, Golang, Docker, Kubernetes, React, etc.
          </Text>
          <SocialLinks>
            <SocialLink href="https://github.com/jiahuipaung" target="_blank" rel="noopener noreferrer">
              <AiOutlineGithub />
            </SocialLink>
            <SocialLink href="https://linkedin.com/in/jiahui-pang-510065352/" target="_blank" rel="noopener noreferrer">
              <AiOutlineLinkedin />
            </SocialLink>
            <SocialLink href="https://" target="_blank" rel="noopener noreferrer">
              <AiOutlineLinkedin />
            </SocialLink>
          </SocialLinks>
        </Content>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AboutMeModal; 