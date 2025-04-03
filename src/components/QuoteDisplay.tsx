import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const QuoteContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.7);
  padding: 15px 25px;
  border-radius: 10px;
  max-width: 80%;
  text-align: center;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const QuoteText = styled.p`
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  font-style: italic;
`;

const QuoteAuthor = styled.p`
  font-size: 14px;
  color: #666;
  text-align: right;
  font-weight: 500;
`;

const quotes = [
  {
    text: "真正的智慧不是知道一切，而是明白自己什么都不知道。",
    author: "苏格拉底"
  },
  {
    text: "人生的意义不在于拥有什么，而在于经历什么。",
    author: "亚瑟·叔本华"
  },
  {
    text: "知足常乐。",
    author: "老子"
  },
  {
    text: "勿以善小而不为，勿以恶小而为之。",
    author: "刘备"
  }
];

const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // 随机选择一个名言
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <QuoteContainer>
      <QuoteText>"{quote.text}"</QuoteText>
      <QuoteAuthor>— {quote.author}</QuoteAuthor>
    </QuoteContainer>
  );
};

export default QuoteDisplay; 