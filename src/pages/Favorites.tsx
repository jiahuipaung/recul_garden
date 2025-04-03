import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import StatusBar from '../components/StatusBar';
import imageCompression from 'browser-image-compression';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';

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

const PhotoContainer = styled(motion.div)<{ $height?: number }>`
  position: relative;
  width: 100%;
  margin-bottom: 8px;
  overflow: hidden;
  background-color: #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
  height: ${props => props.$height ? `${props.$height}px` : 'auto'};
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const LoadingPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

interface PhotoData {
  src: string;
  originalPath: string;
  aspectRatio?: number;
  width?: number;
  height?: number;
}

const calculateDimensions = (aspectRatio: number): { width: number; height: number } => {
  const baseWidth = window.innerWidth > 768 ? 300 : 150;
  return {
    width: baseWidth,
    height: Math.floor(baseWidth / aspectRatio)
  };
};

const Favorites: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoData, setPhotoData] = useState<PhotoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const breakpointColumns = {
    default: 5,
    1920: 4,
    1440: 3,
    1024: 3,
    768: 2,
    500: 1
  };

  useEffect(() => {
    getPhotos();
  }, []);

  const getPhotos = async () => {
    try {
      console.log('开始获取照片列表...');
      const modules = import.meta.glob('/public/assets/photos/*.{jpg,JPG,webp}', { 
        eager: true, 
        query: '?url',
        import: 'default'
      });
      console.log('找到的模块:', modules);
      
      const photoUrls = Object.values(modules).map(url => {
        const urlString = url as string;
        const fileName = urlString.split('/').pop() || '';
        const fullPath = `/assets/photos/${fileName}`;
        console.log('处理图片路径:', { urlString, fileName, fullPath });
        return fullPath;
      });
      
      console.log('处理后的照片URL列表:', photoUrls);
      setPhotos(photoUrls);
    } catch (error) {
      console.error('加载照片时出错:', error);
      setError('加载照片失败，请稍后重试');
    }
  };

  const processImage = async (photo: PhotoData): Promise<string> => {
    try {
      console.log('开始处理图片:', photo.src);
      const response = await fetch(photo.src);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      console.log('获取到图片数据:', { size: blob.size, type: blob.type });
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const compressedFile = await imageCompression(file, options);
      const url = URL.createObjectURL(compressedFile);
      console.log('图片处理完成:', url);
      return url;
    } catch (error) {
      console.error('压缩图片时出错:', error);
      return photo.src;
    }
  };

  // 修改随机排序函数，添加尺寸分组
  const shuffleArray = <T extends PhotoData>(array: T[]): T[] => {
    // 按宽高比分组
    const groups = array.reduce((acc, photo) => {
      const ratio = photo.aspectRatio || 1;
      let group;
      if (ratio > 1.5) group = 'landscape';
      else if (ratio < 0.7) group = 'portrait';
      else group = 'square';
      
      if (!acc[group]) acc[group] = [];
      acc[group].push(photo);
      return acc;
    }, {} as Record<string, T[]>);

    // 打乱每个组内的顺序
    Object.keys(groups).forEach(group => {
      groups[group] = groups[group].sort(() => Math.random() - 0.5);
    });

    // 合并所有组，确保不同尺寸的照片交错排列
    const result: T[] = [];
    const maxLength = Math.max(...Object.values(groups).map(g => g.length));
    
    for (let i = 0; i < maxLength; i++) {
      Object.values(groups).forEach(group => {
        if (group[i]) result.push(group[i]);
      });
    }

    return result;
  };

  useEffect(() => {
    const loadPhotos = async () => {
      console.log('开始加载照片，当前照片数量:', photos.length);
      if (photos.length === 0) {
        console.log('没有照片需要加载');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const loadedPhotos = await Promise.all(
          photos.map(async (photo) => {
            try {
              console.log('处理照片:', photo);
              const photoData: PhotoData = {
                src: photo,
                originalPath: photo
              };
              const processedSrc = await processImage(photoData);
              
              return new Promise<PhotoData>((resolve, reject) => {
                const img = new Image();
                
                img.onload = () => {
                  console.log('图片加载成功:', photo);
                  const aspectRatio = img.width / img.height;
                  const dimensions = calculateDimensions(aspectRatio);
                  resolve({
                    src: processedSrc,
                    originalPath: photo,
                    aspectRatio,
                    width: dimensions.width,
                    height: dimensions.height
                  });
                };
                
                img.onerror = (e) => {
                  console.error(`图片加载失败: ${photo}`, e);
                  const originalSrc = photo.startsWith('/') ? photo : `/${photo}`;
                  
                  const retryImg = new Image();
                  retryImg.onload = () => {
                    console.log('使用原始路径加载成功:', originalSrc);
                    const aspectRatio = retryImg.width / retryImg.height;
                    const dimensions = calculateDimensions(aspectRatio);
                    resolve({
                      src: originalSrc,
                      originalPath: photo,
                      aspectRatio,
                      width: dimensions.width,
                      height: dimensions.height
                    });
                  };
                  retryImg.onerror = () => {
                    console.error(`原始路径也加载失败: ${originalSrc}`);
                    reject(new Error(`加载失败: ${photo}`));
                  };
                  retryImg.src = originalSrc;
                };
                
                img.src = processedSrc;
              });
            } catch (error) {
              console.error(`处理图片出错: ${photo}`, error);
              const originalSrc = photo.startsWith('/') ? photo : `/${photo}`;
              return {
                src: originalSrc,
                originalPath: photo
              };
            }
          })
        );

        // 随机排序照片
        const shuffledPhotos = shuffleArray(loadedPhotos);
        console.log('所有照片加载完成并随机排序:', shuffledPhotos);
        setPhotoData(shuffledPhotos);
      } catch (error) {
        console.error('加载照片时出错:', error);
        setError('加载照片失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, [photos]);

  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages(prev => new Set([...prev, src]));
  }, []);

  const isVideo = (src: string) => src.toLowerCase().endsWith('.mp4');

  if (isLoading) {
    return (
      <Container>
        <StatusBar />
        <div style={{ textAlign: 'center', marginTop: '50px', flex: 1 }}>
          加载中...
        </div>
      </Container>
    );
  }

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
          {photoData.map((photo, index) => (
            <PhotoContainer 
              key={index} 
              $height={photo.height}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {!loadedImages.has(photo.src) && (
                <LoadingPlaceholder>Loading...</LoadingPlaceholder>
              )}
              {isVideo(photo.src) ? (
                <Video
                  src={photo.src}
                  controls
                  preload="metadata"
                  poster={photo.src.replace('.mp4', '.jpg')}
                />
              ) : (
                <Photo 
                  src={photo.src} 
                  alt={`Photo ${index + 1}`} 
                  loading="lazy"
                  onLoad={() => handleImageLoad(photo.src)}
                  style={{ display: loadedImages.has(photo.src) ? 'block' : 'none' }}
                />
              )}
            </PhotoContainer>
          ))}
        </StyledMasonry>
      </div>
    </Container>
  );
};

export default Favorites; 