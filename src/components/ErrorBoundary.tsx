import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to error tracking service (e.g., Sentry) in production
    console.error('Error caught by boundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle size={32} className="text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Algo deu errado
            </h1>
            
            <p className="text-neutral-600 mb-6">
              Desculpe, encontramos um erro inesperado. Por favor, tente novamente ou retorne à página inicial.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-red-50 p-4 rounded mb-6 text-left">
                <summary className="cursor-pointer font-semibold text-red-800 mb-2">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="text-xs text-red-700 overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-institutional hover:bg-institutional-hover text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


