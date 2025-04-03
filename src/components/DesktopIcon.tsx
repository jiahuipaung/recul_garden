import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface DesktopIconProps {
  icon: ReactNode;
  label: string;
  to?: string;
  onClick?: () => void;
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

const IconWrapper = styled(motion.div)<{ position?: DesktopIconProps['position'] }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  position: absolute;
  top: ${({ position }) => position?.top || 'auto'};
  left: ${({ position }) => position?.left || 'auto'};
  right: ${({ position }) => position?.right || 'auto'};
  bottom: ${({ position }) => position?.bottom || 'auto'};
  cursor: pointer;
  text-align: center;
`;

const IconImage = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const IconLabel = styled.div`
  font-size: 14px;
  color: #000;
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.7);
  max-width: 90px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const IconContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const DesktopIcon = ({ icon, label, to, onClick, position }: DesktopIconProps) => {
  const content = (
    <IconContent>
      <IconImage>{icon}</IconImage>
      <IconLabel>{label}</IconLabel>
    </IconContent>
  );

  return (
    <IconWrapper
      position={position}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {to ? (
        <Link to={to}>{content}</Link>
      ) : (
        content
      )}
    </IconWrapper>
  );
};

export default DesktopIcon; 