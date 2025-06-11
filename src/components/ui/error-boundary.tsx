"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import React from "react";
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

class ErrorBoundaryClass extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
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

function DefaultErrorFallback({
	error,
	resetError,
	showDetails = false,
}: ErrorFallbackProps) {
	const isDevelopment = process.env.NODE_ENV === "development";

	return (
		<div
			className={cn(
				"flex min-h-[400px] items-center justify-center p-6",
				glassmorphism.container,
				"rounded-2xl border border-red-500/20",
				"bg-red-500/5",
			)}
		>
			<div className="max-w-md space-y-6 text-center">
				{/* Error Icon */}
				<div
					className={cn(
						"mx-auto flex h-16 w-16 items-center justify-center rounded-full",
						glassmorphism.card,
						"border border-red-500/20",
						"animate-pulse-glow",
					)}
				>
					<AlertTriangle className="h-8 w-8 text-red-400" />
				</div>

				{/* Error Message */}
				<div className="space-y-2">
					<h2 className="font-semibold text-foreground text-xl">
						Something went wrong
					</h2>
					<p className="text-muted-foreground text-sm">
						We encountered an unexpected error. Please try again.
					</p>
				</div>

				{/* Error Details (Development only or when showDetails is true) */}
				{(isDevelopment || showDetails) && error && (
					<div
						className={cn(
							"rounded-lg p-4 text-left",
							glassmorphism.filter,
							"border border-red-500/20",
							"bg-red-500/5",
						)}
					>
						<div className="mb-2 font-medium text-red-400 text-xs">
							Error Details:
						</div>
						<div className="break-all font-mono text-muted-foreground text-xs">
							{error.message}
						</div>
						{error.stack && (
							<details className="mt-2">
								<summary className="cursor-pointer text-red-400 text-xs hover:text-red-300">
									Stack Trace
								</summary>
								<pre className="mt-2 whitespace-pre-wrap text-muted-foreground text-xs">
									{error.stack}
								</pre>
							</details>
						)}
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex flex-col justify-center gap-3 sm:flex-row">
					<button
						onClick={resetError}
						className={cn(
							"rounded-xl px-6 py-3 font-medium transition-all duration-300",
							"flex items-center justify-center gap-2",
							"bg-gradient-to-r from-blue-600 to-purple-600",
							"hover:from-blue-500 hover:to-purple-500",
							"text-white shadow-lg hover:shadow-xl",
							"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
							"transform hover:scale-105 active:scale-95",
						)}
					>
						<RefreshCw className="h-4 w-4" />
						Try Again
					</button>

					<button
						onClick={() => (window.location.href = "/")}
						className={cn(
							"rounded-xl px-6 py-3 font-medium transition-all duration-300",
							"flex items-center justify-center gap-2",
							glassmorphism.button,
							"border border-white/20 dark:border-white/10",
							"hover:bg-white/10 dark:hover:bg-black/20",
							"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
							"transform hover:scale-105 active:scale-95",
						)}
					>
						<Home className="h-4 w-4" />
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
	className,
}: {
	message?: string;
	onRetry?: () => void;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center space-y-4 p-8 text-center",
				glassmorphism.card,
				"rounded-xl border border-red-500/20 bg-red-500/5",
				className,
			)}
		>
			<AlertTriangle className="h-8 w-8 text-red-400" />
			<div className="space-y-2">
				<p className="font-medium text-foreground">{message}</p>
				{onRetry && (
					<button
						onClick={onRetry}
						className={cn(
							"rounded-lg px-4 py-2 font-medium text-sm",
							"transition-all duration-200",
							glassmorphism.button,
							"border border-white/20 dark:border-white/10",
							"hover:bg-white/10 dark:hover:bg-black/20",
							"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
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
	errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
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
