# 个人网站 - 回忆花园

这是一个模仿PC桌面风格的个人网站，使用React、TypeScript和Vite构建。

## 项目结构

```
/src
  /components - 通用组件
    /icons - 图标组件
  /pages - 页面组件
  /styles - 样式文件
/public
  /assets
    /backgrounds - 背景图片
    /icons - 图标资源
```

## 功能特点

- 模拟PC桌面环境，点击图标进入不同页面
- 动态GIF背景效果
- 类macOS风格的顶部状态栏
- 随机显示名言警句
- 响应式设计
- 平滑过渡动画

## 使用说明

### 安装依赖

```bash
npm install
```

### 开发环境启动

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 资源准备

使用前需要准备以下资源文件：

1. 背景GIF：`public/assets/backgrounds/moving-stars.gif`
2. 图标文件（PNG格式）：
   - `public/assets/icons/user-manual.png`
   - `public/assets/icons/blog.png`
   - `public/assets/icons/favorites.png`
   - `public/assets/icons/email.png`
   - `public/assets/icons/about-me.png`
   - `public/assets/icons/database.png`
   - `public/assets/icons/reading.png`

## 技术栈

- React
- TypeScript
- Vite
- styled-components
- Framer Motion
- React Router 