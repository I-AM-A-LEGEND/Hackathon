import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { AuthProvider } from './contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import initializeDatabase from './database/init';
import './styles/globals.css';
import ErrorBoundary from './components/ErrorBoundary';

// Add a loading component
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Set up global loading state for page transitions
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  useEffect(() => {
    // Initialize the database on app startup
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    setupDatabase();
  }, []);

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <AuthProvider>
          {loading && <LoadingOverlay />}
          <Component {...pageProps} />
        </AuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default MyApp; 