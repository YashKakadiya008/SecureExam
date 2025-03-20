import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

import { Toaster } from 'react-hot-toast';

// Apply dark mode to document
document.documentElement.classList.add('dark');

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center p-8 glass-effect-dark rounded-xl">
            <h1 className="text-3xl font-bold text-white mb-4">
              Oops! Something went wrong.
            </h1>
            <p className="mb-6 text-gray-400">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Root app wrapper with animations
const AnimatedApp = () => {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark:bg-black', 'dark:text-white');
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              // Default options for all toasts
              duration: 3000,
              style: {
                background: '#171717',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#000000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#000000',
                },
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AnimatedApp />
    </ErrorBoundary>
  </React.StrictMode>
);
