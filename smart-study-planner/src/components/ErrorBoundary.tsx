import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      errorInfo
    });
  }

  private resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private goToHomePage = (): void => {
    window.location.href = '/';
    this.resetError();
  };

  private refreshPage = (): void => {
    window.location.reload();
  };

  private isDatabaseError(): boolean {
    const errorMessage = this.state.error?.message || '';
    return errorMessage.includes('sqlite3') || 
           errorMessage.includes('database') || 
           errorMessage.includes('sequelize');
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const isDatabaseError = this.isDatabaseError();
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {isDatabaseError ? 'Database Error' : 'Something went wrong'}
            </h2>
            <p className="text-gray-700 mb-4">
              {isDatabaseError 
                ? 'There was an issue connecting to the database. This might be a temporary issue.' 
                : 'We\'re sorry, but there was an error rendering this page. This might be due to a temporary issue.'}
            </p>
            {this.state.error && (
              <div className="bg-red-50 p-4 rounded mb-4 overflow-auto">
                <p className="text-red-700 font-medium">Error details:</p>
                <p className="text-red-600 text-sm break-words">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-700 cursor-pointer">View component stack</summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 p-2 bg-red-50 border border-red-100 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={this.goToHomePage}
              >
                Go to Home
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                onClick={this.refreshPage}
              >
                Refresh Page
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                onClick={this.resetError}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 