import React from 'react';
import styled from 'styled-components';
import StatusBar from '../components/StatusBar';

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
  padding-top: 4rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
`;

const Reading: React.FC = () => {
  return (
    <>
      <StatusBar />
      <Container>
        <Title>阅读</Title>
        <p>这里是阅读页面内容...</p>
      </Container>
    </>
  );
};

export default Reading; 