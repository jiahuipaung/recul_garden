import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Desktop from './pages/Desktop';
import Blog from './pages/Blog';
import Archive from './pages/Blog/Archive';
import PostDetail from './pages/Blog/PostDetail';
import Favorites from './pages/Favorites';
import Email from './pages/Email';
import Database from './pages/Database';
import Reading from './pages/Reading';
import { theme } from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
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
      </Router>
    </ThemeProvider>
  );
}

export default App; 