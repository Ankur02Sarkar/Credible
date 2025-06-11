"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { cn, glassmorphism } from "~/lib/glassmorphism";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  showDetails?: boolean;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError, showDetails = false }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className={cn(
      "min-h-[400px] flex items-center justify-center p-6",
      glassmorphism.container,
      "rounded-2xl border border-red-500/20",
      "bg-red-500/5"
    )}>
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className={cn(
          "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
          glassmorphism.card,
          "border border-red-500/20",
          "animate-pulse-glow"
        )}>
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        {/* Error Details (Development only or when showDetails is true) */}
        {(isDevelopment || showDetails) && error && (
          <div className={cn(
            "p-4 rounded-lg text-left",
            glassmorphism.filter,
            "border border-red-500/20",
            "bg-red-500/5"
          )}>
            <div className="text-xs text-red-400 font-medium mb-2">
              Error Details:
            </div>
            <div className="text-xs text-muted-foreground font-mono break-all">
              {error.message}
            </div>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                  Stack Trace
                </summary>
                <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetError}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-300",
              "flex items-center gap-2 justify-center",
              "bg-gradient-to-r from-blue-600 to-purple-600",
              "hover:from-blue-500 hover:to-purple-500",
              "text-white shadow-lg hover:shadow-xl",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              "transform hover:scale-105 active:scale-95"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => window.location.href = "/"}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-300",
              "flex items-center gap-2 justify-center",
              glassmorphism.button,
              "border border-white/20 dark:border-white/10",
              "hover:bg-white/10 dark:hover:bg-black/20",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              "transform hover:scale-105 active:scale-95"
            )}
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo);
    // You can add error reporting service here
    // e.g., Sentry, LogRocket, etc.
  };
}

// Simple error fallback for specific components
export function SimpleErrorFallback({ 
  message = "Something went wrong", 
  onRetry,
  className 
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center space-y-4",
      glassmorphism.card,
      "rounded-xl border border-red-500/20 bg-red-500/5",
      className
    )}>
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <div className="space-y-2">
        <p className="font-medium text-foreground">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "transition-all duration-200",
              glassmorphism.button,
              "border border-white/20 dark:border-white/10",
              "hover:bg-white/10 dark:hover:bg-black/20",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            )}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Main export
export const ErrorBoundary = ErrorBoundaryClass;

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;