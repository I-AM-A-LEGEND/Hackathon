import { SessionProvider } from 'next-auth/react';
import type { AppProps, AppContext } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import initializeDatabase from '../database/init';
import '../styles/globals.css';
import ErrorBoundary from '../components/ErrorBoundary';

// Add a loading component
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(true); // Assume success by default
  const [dbError, setDbError] = useState<Error | null>(null);

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

  // Server-side database initialization is handled in getInitialProps
  // We don't need to call initializeDatabase() on the client

  // Display a database error message if initialization failed
  if (dbError && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Database Error</h2>
          <p className="text-gray-700 mb-6">
            There was an issue connecting to the database. This is likely due to missing SQLite dependencies.
          </p>
          <p className="text-gray-700 mb-6">
            Please try running <code className="bg-gray-100 px-2 py-1 rounded">npm install sqlite3 --save</code> in your terminal.
          </p>
          <div className="bg-red-50 p-4 rounded mb-4">
            <p className="text-sm text-red-700">{dbError.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

// Initialize database on the server side only
MyApp.getInitialProps = async (appContext: AppContext) => {
  // Only run on server side
  if (typeof window === 'undefined') {
    try {
      await initializeDatabase();
      console.log('Database initialized on server side');
    } catch (error) {
      console.error('Server-side database initialization error:', error);
      // We don't throw here to allow the app to continue loading
    }
  }
  
  return { pageProps: {} };
};

export default MyApp; 