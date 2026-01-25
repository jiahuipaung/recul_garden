import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

// 懒加载所有路由组件
const Desktop = lazy(() => import('./pages/Desktop'));
const Blog = lazy(() => import('./pages/Blog'));
const Archive = lazy(() => import('./pages/Blog/Archive'));
const PostDetail = lazy(() => import('./pages/Blog/PostDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Email = lazy(() => import('./pages/Email'));
const Database = lazy(() => import('./pages/Database'));
const Reading = lazy(() => import('./pages/Reading'));

// 简单的加载组件
const LoadingScreen = () => (
  <div
    style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
      color: '#ffffff',
      fontSize: '1.2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}
  >
    Loading...
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Desktop />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/archive" element={<Archive />} />
            <Route path="/blog/:id" element={<PostDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/email" element={<Email />} />
            <Route path="/database" element={<Database />} />
            <Route path="/reading" element={<Reading />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
