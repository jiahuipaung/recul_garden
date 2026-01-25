/**
 * 生成噪声纹理工具
 * 使用 Canvas API 动态生成噪声纹理，替代 2.8MB 的 PNG 文件
 * 生成的纹理会缓存到 localStorage 以避免重复计算
 */

export interface NoiseTextureOptions {
  width?: number;
  height?: number;
  opacity?: number;
}

/**
 * 生成噪声纹理并返回 data URL
 * @param width - 纹理宽度（默认 300px）
 * @param height - 纹理高度（默认 300px）
 * @param opacity - 不透明度（默认 0.15，范围 0-1）
 * @returns data URL 格式的纹理图片
 */
export const generateNoiseTexture = (
  width = 300,
  height = 300,
  opacity = 0.15
): string => {
  const cacheKey = `noise-texture-${width}x${height}-${opacity}`;

  // 尝试从 localStorage 缓存读取
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (error) {
    // localStorage 可能不可用（如无痕模式），继续生成
    console.warn('localStorage not available, generating noise texture without cache');
  }

  // 创建 Canvas 元素
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context for noise texture generation');
    return '';
  }

  // 创建 ImageData
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // 生成随机噪声像素
  // 每个像素由 4 个值组成：R, G, B, A
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255; // 0-255 的随机值
    data[i] = noise;           // Red
    data[i + 1] = noise;       // Green
    data[i + 2] = noise;       // Blue
    data[i + 3] = opacity * 255; // Alpha（不透明度）
  }

  // 将 ImageData 绘制到 canvas
  ctx.putImageData(imageData, 0, 0);

  // 转换为 data URL
  const dataUrl = canvas.toDataURL('image/png');

  // 缓存到 localStorage
  try {
    localStorage.setItem(cacheKey, dataUrl);
  } catch (error) {
    // localStorage 空间不足或不可用，忽略错误
    console.warn('Failed to cache noise texture to localStorage:', error);
  }

  return dataUrl;
};

/**
 * 清除噪声纹理缓存
 * 用于调试或重新生成纹理
 */
export const clearNoiseTextureCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('noise-texture-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear noise texture cache:', error);
  }
};
