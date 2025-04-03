import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const photosDir = path.join(__dirname, '../public/assets/photos');

// 优化图片
async function optimizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`优化成功: ${path.basename(inputPath)}`);
  } catch (err) {
    console.error(`优化失败 ${path.basename(inputPath)}:`, err);
  }
}

// 处理目录中的所有图片
async function processDirectory() {
  try {
    const files = await fs.promises.readdir(photosDir);
    
    for (const file of files) {
      const inputPath = path.join(photosDir, file);
      const stats = await fs.promises.stat(inputPath);
      
      if (stats.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          const outputPath = path.join(
            photosDir,
            `${path.basename(file, ext)}.webp`
          );
          await optimizeImage(inputPath, outputPath);
        }
      }
    }
    
    console.log('所有图片优化完成！');
  } catch (err) {
    console.error('处理目录失败:', err);
  }
}

processDirectory(); 