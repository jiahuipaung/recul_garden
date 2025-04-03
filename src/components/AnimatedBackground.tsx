import { ReactNode } from 'react';
import styled from 'styled-components';

interface AnimatedBackgroundProps {
  videoUrl: string;
  children: ReactNode;
}

const VideoBackground = styled.video`
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -2;
  object-fit: cover;
`;

const NoiseOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  z-index: -1;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.3);
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/assets/backgrounds/noise.png");
    mix-blend-mode: hard-light;
    opacity: 1;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 24px; /* 为顶部状态栏留出空间 */
`;

const AnimatedBackground = ({ videoUrl, children }: AnimatedBackgroundProps) => {
  return (
    <>
      <VideoBackground autoPlay loop muted playsInline>
        <source src={videoUrl} type="video/mp4" />
        你的浏览器不支持视频背景。
      </VideoBackground>
      <NoiseOverlay />
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};

export default AnimatedBackground;