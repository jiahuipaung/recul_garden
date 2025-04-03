import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import heicConvert from 'heic-convert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const photosDir = path.join(__dirname, '../public/assets/photos');

// 读取目录中的所有文件
fs.readdir(photosDir, async (err, files) => {
  if (err) {
    console.error('读取目录失败:', err);
    return;
  }

  // 过滤出HEIC文件
  const heicFiles = files.filter(file => 
    file.toLowerCase().endsWith('.heic')
  );

  console.log(`找到 ${heicFiles.length} 个HEIC文件`);

  // 转换每个HEIC文件
  for (const file of heicFiles) {
    try {
      const inputPath = path.join(photosDir, file);
      const outputPath = path.join(photosDir, file.replace(/\.heic$/i, '.jpg'));
      
      const inputBuffer = await fs.promises.readFile(inputPath);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 0.9
      });

      await fs.promises.writeFile(outputPath, outputBuffer);
      console.log(`转换成功: ${file} -> ${path.basename(outputPath)}`);

      // 删除原HEIC文件
      await fs.promises.unlink(inputPath);
      console.log(`已删除原文件: ${file}`);
    } catch (err) {
      console.error(`处理失败 ${file}:`, err);
    }
  }

  console.log('所有转换操作完成');
}); 