import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout';
import Home from '@/pages/home';
import Discover from '@/pages/discover';
import Challenges from '@/pages/challenges';
import Profile from '@/pages/profile';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'discover':
        return <Discover />;
      case 'challenges':
        return <Challenges />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="artify-theme">
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;