import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import aboutMeRaw from '../../content/about-me.md?raw';
import { blogTheme as t } from '../../styles/theme';

const Wrap = styled.div`
  max-width: 720px;
  font-family: ${t.body_serif};
  color: ${t.body};
  line-height: 1.85;

  h1 {
    font-family: ${t.serif};
    font-size: 2.6rem;
    font-weight: 700;
    color: ${t.ink};
    margin: 0 0 8px 0;
    line-height: 1.2;
  }

  h2 {
    font-family: ${t.serif};
    font-size: 1.4rem;
    color: ${t.ink};
    margin-top: 2rem;
    margin-bottom: 0.8rem;
    font-weight: 700;
  }

  p { margin: 0 0 1.2rem 0; }

  ul {
    padding-left: 1.4rem;
    margin-bottom: 1.2rem;
  }

  li { margin-bottom: 0.4rem; }

  a {
    color: ${t.accent};
    text-decoration: none;
    border-bottom: 1px solid ${t.rule};

    &:hover { border-bottom-color: ${t.accent}; }
  }
`;

const About: React.FC = () => (
  <Wrap>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{aboutMeRaw}</ReactMarkdown>
  </Wrap>
);

export default About;
