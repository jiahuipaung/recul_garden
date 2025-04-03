import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import EmailModal from '../components/EmailModal';
import AnimatedBackground from '../components/AnimatedBackground';
import StatusBar from '../components/StatusBar';
import DesktopIcon from '../components/DesktopIcon';

// 导入图标组件
import UserManualIcon from '../components/icons/UserManualIcon';
import BlogIcon from '../components/icons/BlogIcon';
import FavoritesIcon from '../components/icons/FavoritesIcon';
import EmailIcon from '../components/icons/EmailIcon';
import AboutMeIcon from '../components/icons/AboutMeIcon';
import DatabaseIcon from '../components/icons/DatabaseIcon';
import ReadingIcon from '../components/icons/ReadingIcon';
import QuoteDisplay from '../components/QuoteDisplay';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: transparent;
`;

const Email: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/');
  };

  useEffect(() => {
    // 如果用户直接关闭弹窗（例如按ESC键），也要返回首页
    if (!isModalOpen) {
      navigate('/');
    }
  }, [isModalOpen, navigate]);

  // 桌面背景视频 URL
  const videoUrl = '/assets/backgrounds/background-video.mp4';

  return (
    <>
      <StatusBar />
      <AnimatedBackground videoUrl={videoUrl}>
        <Container>
          {/* 用户手册图标 */}
          <DesktopIcon
            icon={<UserManualIcon />}
            label="User Manual"
            to="/user-manual"
            position={{ top: '50px', left: '30px' }}
          />

          {/* 博客图标 */}
          <DesktopIcon
            icon={<BlogIcon />}
            label="Blog"
            to="/blog"
            position={{ top: '50px', left: '150px' }}
          />

          {/* 收藏夹图标 */}
          <DesktopIcon
            icon={<FavoritesIcon />}
            label="Favorites"
            to="/favorites"
            position={{ top: '170px', left: '30px' }}
          />

          {/* 邮箱图标 */}
          <DesktopIcon
            icon={<EmailIcon />}
            label="Email"
            to="/email"
            position={{ top: '50px', right: '150px' }}
          />

          {/* 关于我图标 */}
          <DesktopIcon
            icon={<AboutMeIcon />}
            label="About Me"
            to="/about-me"
            position={{ top: '50px', right: '30px' }}
          />

          {/* 数据库图标 */}
          <DesktopIcon
            icon={<DatabaseIcon />}
            label="Database"
            to="/database"
            position={{ bottom: '150px', left: '30px' }}
          />

          {/* 阅读图标 */}
          <DesktopIcon
            icon={<ReadingIcon />}
            label="Reading"
            to="/reading"
            position={{ bottom: '30px', right: '30px' }}
          />

          {/* 名言显示 */}
          <QuoteDisplay />

          <EmailModal isOpen={isModalOpen} onClose={handleClose} />
        </Container>
      </AnimatedBackground>
    </>
  );
};

export default Email; 