import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import StatusBar from '../components/StatusBar';
import ReactMarkdown from 'react-markdown';
import { FileNode } from '../types/file';
import { parseFileTree, loadFileContent } from '../utils/fileSystem';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  color: #333;
  padding-top: 5px;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top:5px;
`;

const Sidebar = styled.div`
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #fff;
`;

const DirectoryTree = styled.div`
  font-family: 'Monaco', monospace;
  font-size: 14px;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px;
`;

const TreeNode = styled.div<{ $level: number }>`
  padding: 4px 0;
  padding-left: ${props => props.$level * 16}px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const NodeIcon = styled.span`
  margin-right: 8px;
  font-size: 12px;
  width: 16px;
  text-align: center;
  color: #666;
`;

const NodeLabel = styled.span<{ $isSelected?: boolean }>`
  color: ${props => props.$isSelected ? '#2196f3' : '#333'};
  font-weight: ${props => props.$isSelected ? '500' : 'normal'};
`;

const MarkdownContent = styled.div`
  color: #333;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  
  h1, h2, h3, h4, h5, h6 {
    color:rgb(52, 54, 56);
    margin-top: 24px;
    margin-bottom: 16px;
  }
  
  p {
    margin: 16px 0;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', monospace;
    color:rgb(187, 108, 133);
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    border: 1px solid #e0e0e0;
  }

  a {
    color:rgb(120, 122, 124);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 4px solidrgb(99, 100, 101);
    margin: 0;
    padding-left: 16px;
    color: #666;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
  }

  th, td {
    border: 1px solid #e0e0e0;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color:rgb(200, 199, 199);
  }
`;

const HomeButton = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: rgb(172, 173, 174);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10;

  &:hover {
    background-color: rgb(154, 156, 158);
  }

  svg {
    margin-right: 8px;
  }
`;

const Database: React.FC = () => {
  const navigate = useNavigate();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');

  useEffect(() => {
    loadFileTree();
  }, []);

  const loadFileTree = async () => {
    try {
      const tree = await parseFileTree('');
      setFileTree(tree);
    } catch (error) {
      console.error('加载文件树失败:', error);
    }
  };

  const handleNodeClick = (node: FileNode) => {
    if (node.type === 'directory') {
      setFileTree(prevTree => toggleNodeExpanded(prevTree, node.path));
    } else {
      setSelectedFile(node.path);
      loadMarkdownContent(node.path);
    }
  };

  const toggleNodeExpanded = (tree: FileNode[], path: string): FileNode[] => {
    return tree.map(node => {
      if (node.path === path) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (node.children) {
        return { ...node, children: toggleNodeExpanded(node.children, path) };
      }
      return node;
    });
  };

  const loadMarkdownContent = async (filePath: string) => {
    try {
      const content = await loadFileContent(filePath);
      setMarkdownContent(content || '# 文件内容为空');
    } catch (error) {
      console.error('加载文件内容失败:', error);
      setMarkdownContent('# 加载失败\n\n请重试或检查文件是否存在。');
    }
  };

  const renderTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map(node => (
      <React.Fragment key={node.path}>
        <TreeNode 
          $level={level} 
          onClick={() => handleNodeClick(node)}
        >
          <NodeIcon>
            {node.type === 'directory' 
              ? (node.isExpanded ? '▼' : '▶') 
              : '📄'}
          </NodeIcon>
          <NodeLabel $isSelected={selectedFile === node.path}>
            {node.name}
          </NodeLabel>
        </TreeNode>
        {node.type === 'directory' && node.isExpanded && node.children && (
          renderTree(node.children, level + 1)
        )}
      </React.Fragment>
    ));
  };

  return (
    <Container>
      <StatusBar />
      <Content>
        <Sidebar>
          <DirectoryTree>
            {renderTree(fileTree)}
          </DirectoryTree>
          <HomeButton onClick={() => navigate('/')}>
            {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> */}
            Back
          </HomeButton>
        </Sidebar>
        <MainContent>
          <MarkdownContent>
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </MarkdownContent>
        </MainContent>
      </Content>
    </Container>
  );
};

export default Database; 