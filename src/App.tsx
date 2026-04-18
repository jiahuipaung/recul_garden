import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

// 懒加载所有路由组件
const Desktop = lazy(() => import('./pages/Desktop'));
const BlogLayout = lazy(() => import('./components/Blog/BlogLayout'));
const Overview = lazy(() => import('./pages/Blog/Overview'));
const Archive = lazy(() => import('./pages/Blog/Archive'));
const PostDetail = lazy(() => import('./pages/Blog/PostDetail'));
const Tag = lazy(() => import('./pages/Blog/Tag'));
const About = lazy(() => import('./pages/Blog/About'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Email = lazy(() => import('./pages/Email'));
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
            <Route path="/blog" element={<BlogLayout />}>
              <Route index element={<Overview />} />
              <Route path="archive" element={<Archive />} />
              <Route path="tags/:tag" element={<Tag />} />
              <Route path="about" element={<About />} />
              <Route path=":id" element={<PostDetail />} />
            </Route>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/email" element={<Email />} />
            <Route path="/reading" element={<Reading />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
