import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
`;

const Drawer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 360px;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 40px 32px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const Title = styled.h1`
  font-size: 17px;
  margin: 0 auto 0px;
  margin-bottom: 20px;
  width: 120px;
  font-weight: 300;
  color: rgb(0, 0, 0);
  background-color: rgba(250, 249, 249, 1);
  padding: 0px 2px;
  border-radius: 0px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 1px;
`;

const Text = styled.p`
  font-size: 15px;
  margin-top: 20px;
  line-height: 1.6;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
`;

interface UserManualDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManualDrawer: React.FC<UserManualDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Drawer
            initial={{ x: -360 }}
            animate={{ x: 0 }}
            exit={{ x: -360 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <CloseButton onClick={onClose}>×</CloseButton>
            <Title>Introduction</Title>
            
            <Text>
                A place where I record my thoughts and share my knowledge.
            </Text>

            <Text>
                If you have any questions, you can contact me by any means you can find.
            </Text>
            <Text>
                Wish you a good day : ）
            </Text>
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserManualDrawer; 