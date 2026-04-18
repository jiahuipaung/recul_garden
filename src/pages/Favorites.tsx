import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import StatusBar from '../components/StatusBar';
import Masonry from 'react-masonry-css';

// ── useInView Hook ──────────────────────────────────────────────────
function useInView(
  ref: React.RefObject<HTMLElement | null>,
  rootMargin = '200px',
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

// ── Styled Components ───────────────────────────────────────────────
const Container = styled.div`
  background-color: #000;
  color: #fff;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledMasonry = styled(Masonry)`
  display: flex;
  width: 100%;
  max-width: 100%;
  margin-top: 30px;
  padding: 0 4px;

  .masonry-grid_column {
    padding: 0 4px;
    background-clip: padding-box;
  }
`;

const PhotoContainer = styled.div<{ $aspectRatio: number }>`
  position: relative;
  width: 100%;
  margin-bottom: 8px;
  overflow: hidden;
  background-color: #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
  aspect-ratio: ${props => props.$aspectRatio};
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease, aspect-ratio 0.3s ease;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

// ── LazyPhoto Component ─────────────────────────────────────────────
interface LazyPhotoProps {
  src: string;
  index: number;
  defaultAspectRatio: number;
}

const LazyPhoto: React.FC<LazyPhotoProps> = React.memo(({ src, index, defaultAspectRatio }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef);
  const [loaded, setLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
    setLoaded(true);
  }, []);

  return (
    <PhotoContainer
      ref={containerRef}
      $aspectRatio={aspectRatio}
      className={inView ? 'visible' : ''}
    >
      {inView && (
        <Photo
          src={src}
          alt={`Photo ${index + 1}`}
          loading="lazy"
          onLoad={handleLoad}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
    </PhotoContainer>
  );
});

// ── Favorites Page ──────────────────────────────────────────────────
const DEFAULT_RATIOS = [0.67, 0.75, 0.8, 1.0, 1.33];

const breakpointColumns = {
  default: 5,
  1920: 4,
  1440: 3,
  1024: 3,
  768: 2,
  500: 1,
};

const Favorites: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const photoUrls = useMemo(() => {
    try {
      const modules = import.meta.glob('../assets/photos/*.webp', {
        eager: true,
        query: '?url',
        import: 'default',
      });
      const urls = Object.values(modules) as string[];
      // Fisher-Yates shuffle
      const shuffled = [...urls];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    } catch {
      setError('加载照片失败，请稍后重试');
      return [];
    }
  }, []);

  if (error) {
    return (
      <Container>
        <StatusBar />
        <div style={{ textAlign: 'center', marginTop: '50px', color: 'red', flex: 1 }}>
          错误: {error}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <StyledMasonry
          breakpointCols={breakpointColumns}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {photoUrls.map((url, index) => (
            <LazyPhoto
              key={url}
              src={url}
              index={index}
              defaultAspectRatio={DEFAULT_RATIOS[index % DEFAULT_RATIOS.length]}
            />
          ))}
        </StyledMasonry>
      </div>
    </Container>
  );
};

export default Favorites;
