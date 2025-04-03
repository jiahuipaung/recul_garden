import { useState } from 'react';
import styled from 'styled-components';
import AnimatedBackground from '../components/AnimatedBackground';
import DesktopIcon from '../components/DesktopIcon';
import StatusBar from '../components/StatusBar';
import AboutMeModal from '../components/modals/AboutMe';
import UserManualDrawer from '../components/UserManualDrawer';

// 导入图标组件
import UserManualIcon from '../components/icons/UserManualIcon';
import BlogIcon from '../components/icons/BlogIcon';
import FavoritesIcon from '../components/icons/FavoritesIcon';
import EmailIcon from '../components/icons/EmailIcon';
import AboutMeIcon from '../components/icons/AboutMeIcon';
import DatabaseIcon from '../components/icons/DatabaseIcon';
import ReadingIcon from '../components/icons/ReadingIcon';
import QuoteDisplay from '../components/QuoteDisplay';

const DesktopContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: transparent;
`;

const Desktop = () => {
  const [isAboutMeOpen, setIsAboutMeOpen] = useState(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  // 桌面背景视频 URL
  const videoUrl = '/assets/backgrounds/background-video.mp4';

  return (
    <>
      <StatusBar />
      <AnimatedBackground videoUrl={videoUrl}>
        <DesktopContainer>
          {/* 用户手册图标 */}
          <DesktopIcon
            icon={<UserManualIcon />}
            label="User Manual"
            onClick={() => setIsUserManualOpen(true)}
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
            onClick={() => setIsAboutMeOpen(true)}
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
        </DesktopContainer>
      </AnimatedBackground>
      
      <AboutMeModal 
        isOpen={isAboutMeOpen}
        onClose={() => setIsAboutMeOpen(false)}
      />

      <UserManualDrawer
        isOpen={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
      />
    </>
  );
};

export default Desktop; 