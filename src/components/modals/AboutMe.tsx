import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import aboutMeRaw from '../../content/about-me.md?raw';

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

const MarkdownBody = styled.div`
  color: #333;
  line-height: 1.7;

  h1 {
    font-size: 36px;
    margin-bottom: 8px;
    color: #333;
    font-weight: 600;
  }

  h2 {
    font-size: 24px;
    color: #666;
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: normal;
  }

  p {
    font-size: 16px;
    margin-bottom: 10px;
    color: #444;
  }

  ul {
    padding-left: 20px;
    margin-bottom: 12px;
  }

  li {
    font-size: 16px;
    color: #444;
    margin-bottom: 6px;
  }

  a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #333;
      text-decoration: underline;
    }
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
          <MarkdownBody>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aboutMeRaw}
            </ReactMarkdown>
          </MarkdownBody>
        </Content>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AboutMeModal;
