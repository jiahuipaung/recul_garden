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
    text: "我們不要在這裡，跟我回去十八歲，躲到台大校園杜鵑花叢下，不要被命運找到。\n",
    author: "簡媜《陪我散步吧》"
  },
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