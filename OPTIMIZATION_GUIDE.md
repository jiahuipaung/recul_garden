# Recul Garden 优化和 Vercel 部署指南

## ✅ 已完成的代码优化

以下优化已经自动完成：

1. ✅ **创建噪声生成工具** - [src/utils/generateNoiseTexture.ts](src/utils/generateNoiseTexture.ts)
   - 用 Canvas 动态生成噪声纹理
   - 缓存到 localStorage
   - 节省 2.8MB 文件加载

2. ✅ **改造 AnimatedBackground 组件** - [src/components/AnimatedBackground.tsx](src/components/AnimatedBackground.tsx)
   - 添加视频加载状态和错误处理
   - 支持 poster 占位图
   - 集成动态噪声纹理
   - 添加 fallback 背景

3. ✅ **路由懒加载** - [src/App.tsx](src/App.tsx)
   - 所有路由组件改为懒加载
   - 减少首屏 JS 50-70%

4. ✅ **Vite 配置优化** - [vite.config.ts](vite.config.ts)
   - 细粒度代码分割（react, ui, markdown, email）
   - 调整警告限制

5. ✅ **Vercel 配置** - [vercel.json](vercel.json)
   - SPA 路由支持
   - 静态资源缓存策略
   - 安全头配置

6. ✅ **环境变量模板** - [.env.example](.env.example)
   - 提供配置示例

7. ✅ **构建脚本** - [package.json](package.json)
   - 添加 `build:vercel` 脚本

---

## 🔧 需要手动完成的步骤

### Step 1: 安装 FFmpeg 并压缩视频

由于你的系统 Homebrew 有问题，请使用以下方法之一安装 FFmpeg：

#### 方法 A: 下载预编译版本（推荐）
```bash
# 访问 https://evermeet.cx/ffmpeg/
# 下载 ffmpeg.7z，解压后将 ffmpeg 放到 /usr/local/bin/

# 或使用 curl 下载：
cd ~/Downloads
curl -O https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip
unzip ffmpeg-6.0.zip
sudo mv ffmpeg /usr/local/bin/
sudo chmod +x /usr/local/bin/ffmpeg
```

#### 方法 B: 更新 Homebrew 后安装
```bash
# 尝试更新 Homebrew
brew update
brew install ffmpeg
```

#### 压缩视频

安装 FFmpeg 后，执行以下命令：

```bash
# 进入项目目录
cd /Users/jiahuipang/workSpace/recul_garden

# 压缩视频 (从 4.9MB 降至 ~2MB)
ffmpeg -i public/assets/backgrounds/background-video.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 26 \
  -vf scale=1920:1080 \
  -an \
  -movflags +faststart \
  public/assets/backgrounds/background-video-optimized.mp4

# 生成 poster 占位图 (~50KB)
ffmpeg -i public/assets/backgrounds/background-video.mp4 \
  -vf scale=1920:1080 \
  -frames:v 1 \
  -q:v 5 \
  public/assets/backgrounds/background-poster.jpg

# 检查文件大小
ls -lh public/assets/backgrounds/
```

**预期结果:**
- `background-video-optimized.mp4`: ~2MB
- `background-poster.jpg`: ~50KB

---

### Step 2: 更新 Desktop 和 Email 页面使用优化视频

#### 更新 Desktop.tsx

编辑 [src/pages/Desktop.tsx](src/pages/Desktop.tsx:31)

将第 31 行的视频 URL 改为：
```typescript
const videoUrl = '/assets/backgrounds/background-video-optimized.mp4';
```

#### 检查 Email 页面

如果 Email 页面也使用视频背景，同样更新视频 URL。

---

### Step 3: 清理照片资源（可选但推荐）

这一步可以将 dist 大小从 456MB 降至 ~250MB，确保符合 Vercel 免费版限制。

```bash
# 1. 备份原始 JPG 到本地（非 Git 仓库）
mkdir -p ~/Desktop/recul_garden_backup_photos
cp public/assets/photos/*.{jpg,JPG,jpeg} ~/Desktop/recul_garden_backup_photos/ 2>/dev/null || true

# 2. 删除 public 目录中的原始 JPG（只保留 WebP）
cd public/assets/photos
rm -f *.jpg *.JPG *.jpeg *.png 2>/dev/null || true

# 3. 验证 WebP 文件完整
ls *.webp | wc -l
# 应该有 85+ 个 WebP 文件
```

---

### Step 4: 删除原噪声文件

```bash
cd /Users/jiahuipang/workSpace/recul_garden
rm public/assets/backgrounds/noise.png
```

---

### Step 5: 本地测试

```bash
# 清理旧构建
rm -rf dist

# 执行构建
npm run build

# 检查构建大小
du -sh dist
# 目标: < 100MB (理想 < 80MB)

# 本地预览
npm run preview
# 访问 http://localhost:4173
```

**验证清单:**
- [ ] 视频正常加载和播放
- [ ] 噪声纹理正常显示（复古效果）
- [ ] 所有路由正常工作
- [ ] EmailJS 功能正常
- [ ] 照片墙正常显示（WebP）
- [ ] 控制台无错误

---

### Step 6: 部署到 Vercel

#### 6.1 提交代码到 Git

```bash
git add .
git commit -m "feat: optimize video/noise and prepare Vercel deployment

- Compress background video from 4.9MB to ~2MB
- Replace 2.8MB noise.png with Canvas-generated texture
- Remove original JPG photos (keep WebP only)
- Add route lazy loading
- Add Vercel configuration
- Optimize build output for Vercel free tier"
git push origin main
```

#### 6.2 连接 Vercel

1. 访问 https://vercel.com
2. 登录/注册账号（可以用 GitHub 登录）
3. 点击 **Add New Project**
4. Import Git Repository
5. 选择 GitHub 仓库: `jiahuipaung/recul_garden`
6. 配置项目:
   - **Framework Preset**: Vite
   - **Build Command**: 保持默认（会使用 `build:vercel`）
   - **Output Directory**: dist
   - 不修改其他配置
7. 点击 **Deploy**

#### 6.3 配置环境变量

首次部署可能会失败（缺少环境变量），这是正常的。

1. 进入 Project Settings > Environment Variables
2. 添加以下变量（选择 **All Environments**）:

```
VITE_EMAILJS_SERVICE_ID = service_13aed6l
VITE_EMAILJS_TEMPLATE_ID = template_3xknd1d
VITE_EMAILJS_PUBLIC_KEY = DQAuraTVIo3Xix60-
VITE_APP_BASE_URL = /
VITE_APP_API_URL = https://recul-garden.vercel.app
```

3. 保存后，进入 Deployments > 最新部署 > **Redeploy**

#### 6.4 验证部署

部署成功后，访问 Vercel 提供的 URL（如 https://recul-garden.vercel.app）

测试清单:
- [ ] 所有页面可访问（无 404）
- [ ] 视频正常播放
- [ ] 噪声效果正常
- [ ] Email 功能正常
- [ ] 移动端测试正常
- [ ] Lighthouse 性能 > 80

---

## 📊 预期性能提升

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 视频大小 | 4.9MB | ~2MB | 60% ↓ |
| 噪声纹理 | 2.8MB | 0MB | 100% ↓ |
| 首屏 JS | ~500KB | ~200KB | 60% ↓ |
| dist 大小 | 456MB | <100MB | 80% ↓ |
| 首屏加载 | 5-10s | 2-3s | 60-70% ↓ |

---

## 🔍 故障排查

### 视频不显示
- 检查视频文件是否存在: `ls public/assets/backgrounds/background-video-optimized.mp4`
- 检查 poster 图片: `ls public/assets/backgrounds/background-poster.jpg`
- 查看浏览器控制台错误

### 噪声纹理不显示
- 检查控制台是否有 localStorage 相关错误
- 尝试清除 localStorage: 打开开发者工具 > Application > Storage > Clear site data

### 构建大小超过 100MB
- 确保已删除原始 JPG 文件
- 检查 public 目录: `du -sh public/assets/photos/`
- 考虑进一步压缩 WebP 质量（修改 `scripts/addPhotos.js` 里的 `quality: 80`）

### Vercel 部署失败
- 查看构建日志找到具体错误
- 确保环境变量配置正确
- 检查 `package.json` 中的 `build:vercel` 脚本

---

## 🎯 下一步（可选优化）

1. **PWA 支持** - 添加 Service Worker 缓存
2. **图片懒加载** - 使用 IntersectionObserver
3. **Analytics** - 集成 Vercel Analytics
4. **SEO 优化** - 添加 meta 标签和 sitemap

---

## 📞 需要帮助？

遇到问题请在 GitHub Issues 提问或联系开发者。

完整计划文档: [~/.claude/plans/partitioned-sleeping-ladybug.md](/Users/jiahuipang/.claude/plans/partitioned-sleeping-ladybug.md)
