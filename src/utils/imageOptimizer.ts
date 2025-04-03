import imageCompression from 'browser-image-compression';

export const optimizeImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,             // 最大文件大小
    maxWidthOrHeight: 1920,   // 最大宽度或高度
    useWebWorker: true,       // 使用 Web Worker 处理
    fileType: 'image/webp',   // 转换为 WebP 格式
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('图片压缩失败:', error);
    return file;
  }
}; 