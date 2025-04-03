import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Button = styled(motion.button)`
  position: fixed;
  top: 40px;
  left: 20px;
  background-color: #f0f0f0;
  border: 2px solid #808080;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  z-index: 100;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const BackButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate('/')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Back to Home
    </Button>
  );
};

export default BackButton; 