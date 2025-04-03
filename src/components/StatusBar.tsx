import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StatusBarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 24px;
  background-color: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  z-index: 1000;
  color: white;
  font-size: 12px;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
`;

const StatusRight = styled.div`
  display: flex;
  align-items: center;
`;

const StatusIcon = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const Clock = styled(motion.div)`
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.5px;
`;

const StatusBar = () => {
  const [dateTime, setDateTime] = useState('');
  
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setDateTime(now.toLocaleString('en-US', options));
    };
    
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <StatusBarContainer>
      <StatusLeft>
        <StatusIcon>🏠</StatusIcon>
        <span>Recul's Garden</span>
      </StatusLeft>
      <StatusRight>
        <Clock
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {dateTime}
        </Clock>
      </StatusRight>
    </StatusBarContainer>
  );
};

export default StatusBar; 