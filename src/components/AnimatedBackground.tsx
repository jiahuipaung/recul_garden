import { ReactNode, useState, useEffect } from 'react';
import styled from 'styled-components';
import { generateNoiseTexture } from '../utils/generateNoiseTexture';

interface AnimatedBackgroundProps {
  videoUrl: string;
  children: ReactNode;
  posterUrl?: string;
}

const VideoBackground = styled.video<{ $isLoaded: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -2;
  object-fit: cover;
  opacity: ${props => props.$isLoaded ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
`;

const NoiseOverlay = styled.div<{ $noiseTexture: string }>`
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
    background-image: url(${props => props.$noiseTexture});
    background-repeat: repeat;
    mix-blend-mode: hard-light;
    opacity: 1;
  }
`;

const FallbackBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  background: linear-gradient(
    135deg,
    #1e3c72 0%,
    #2a5298 50%,
    #1e3c72 100%
  );
`;

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 24px; /* 为顶部状态栏留出空间 */
`;

const AnimatedBackground = ({
  videoUrl,
  children,
  posterUrl = '/assets/backgrounds/background-poster.jpg'
}: AnimatedBackgroundProps) => {
  const [noiseTexture, setNoiseTexture] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // 生成噪声纹理
  useEffect(() => {
    // 延迟生成噪声，优先加载视频
    const timer = setTimeout(() => {
      const texture = generateNoiseTexture(300, 300, 0.15);
      setNoiseTexture(texture);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    console.error('Failed to load background video');
    setVideoError(true);
  };

  return (
    <>
      {!videoError ? (
        <VideoBackground
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl}
          $isLoaded={videoLoaded}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
        >
          <source src={videoUrl} type="video/mp4" />
          你的浏览器不支持视频背景。
        </VideoBackground>
      ) : (
        <FallbackBackground />
      )}
      <NoiseOverlay $noiseTexture={noiseTexture} />
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};

export default AnimatedBackground;
