"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCardGrid } from "~/components/credit-cards/CreditCardGrid";
import { FilterContainer } from "~/components/filters/FilterContainer";
import {
	ErrorBoundary,
	SimpleErrorFallback,
} from "~/components/ui/error-boundary";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";
import type {
	CardFeature,
	CreditCard,
	CreditCardApiResponse,
	FilterOptions,
} from "~/types/credit-card";

export default function Home() {
	const [filters, setFilters] = useState<FilterOptions>({
		sortby: "",
		privileges: "",
		emptype: "",
		incomeRange: "",
		page: 0,
	});

	const [cards, setCards] = useState<CreditCard[]>([]);
	const [features, setFeatures] = useState<CardFeature[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [totalCards, setTotalCards] = useState(0);

	const fetchCards = useCallback(
		async (currentFilters: FilterOptions, isLoadMore = false) => {
			try {
				if (isLoadMore) {
					setLoadingMore(true);
				} else {
					setLoading(true);
					setError(null);
				}

				const response = await fetch("/api/cards", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(currentFilters),
				});

				if (!response.ok) {
					const errorMessage =
						response.status === 404
							? "API endpoint not found"
							: response.status === 500
								? "Server error occurred"
								: `Request failed with status ${response.status}`;
					throw new Error(errorMessage);
				}

				const result: CreditCardApiResponse = await response.json();

				// Validate the response structure
				if (!result || !Array.isArray(result.cardIssuer)) {
					throw new Error("Invalid response format from server");
				}

				if (isLoadMore) {
					setCards((prevCards) => [...prevCards, ...result.cardIssuer]);
					setFeatures((prevFeatures) => [
						...prevFeatures,
						...result.cardFeatureList,
					]);
				} else {
					setCards(result.cardIssuer);
					setFeatures(result.cardFeatureList);
				}

				setTotalCards(result.totalCardCount);
				setHasMore(
					result.cardIssuer.length > 0 &&
						cards.length + result.cardIssuer.length < result.totalCardCount,
				);
			} catch (err) {
				console.error("Error fetching cards:", err);
				const errorMessage =
					err instanceof Error ? err.message : "Failed to fetch credit cards";
				setError(errorMessage);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[cards.length],
	);

	const handleFiltersChange = useCallback(
		(newFilters: FilterOptions) => {
			const updatedFilters = { ...newFilters, page: 0 };
			setFilters(updatedFilters);
			fetchCards(updatedFilters, false);
		},
		[fetchCards],
	);

	const handleLoadMore = useCallback(() => {
		if (hasMore && !loadingMore) {
			const nextPageFilters = { ...filters, page: filters.page + 1 };
			setFilters(nextPageFilters);
			fetchCards(nextPageFilters, true);
		}
	}, [filters, hasMore, loadingMore, fetchCards]);

	// Initial load
	useEffect(() => {
		fetchCards(filters, false);
	}, []); // Empty dependency array for initial load only

	return (
		<ErrorBoundary
			onError={(error, errorInfo) => {
				console.error("Home page error:", error, errorInfo);
				// Add error reporting service here
			}}
			showDetails={process.env.NODE_ENV === "development"}
		>
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 dark:from-black dark:via-slate-900 dark:to-purple-950">
				{/* Background Elements */}
				<div className="pointer-events-none fixed inset-0 overflow-hidden">
					<div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
					<div className="absolute top-3/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000" />
					<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform animate-pulse rounded-full bg-pink-500/5 blur-3xl delay-2000" />
				</div>

				{/* Content */}
				<div className="relative z-10">
					{/* Main Content */}
					<div className="mx-auto max-w-7xl space-y-8 p-4">
						{/* Filters Section */}
						<ErrorBoundary
							fallback={({ resetError }) => (
								<SimpleErrorFallback
									message="Failed to load filters"
									onRetry={resetError}
								/>
							)}
						>
							<div className="pt-4">
								<FilterContainer
									filters={filters}
									onFiltersChangeAction={handleFiltersChange}
									className="fade-in-0 slide-in-from-top-4 animate-in duration-700"
								/>
							</div>
						</ErrorBoundary>

						{/* Cards Section */}
						<ErrorBoundary
							fallback={({ resetError }) => (
								<SimpleErrorFallback
									message="Failed to load credit cards"
									onRetry={() => {
										resetError();
										fetchCards(filters, false);
									}}
								/>
							)}
						>
							<div className="fade-in-0 slide-in-from-bottom-4 animate-in delay-300 duration-700">
								<CreditCardGrid
									cards={cards}
									features={features}
									loading={loading}
									error={error}
									onLoadMore={handleLoadMore}
									hasMore={hasMore}
									loadingMore={loadingMore}
								/>
							</div>
						</ErrorBoundary>

						{/* Stats Section */}
						{cards.length > 0 && !loading && (
							<ErrorBoundary
								fallback={() => (
									<SimpleErrorFallback message="Failed to load statistics" />
								)}
							>
								<div
									className={cn(
										"grid grid-cols-1 gap-6 rounded-2xl p-6 md:grid-cols-3",
										glassmorphism.container,
										glassGradients.card,
										"border border-white/10 dark:border-white/5",
										"fade-in-0 slide-in-from-bottom-4 animate-in delay-500 duration-700",
									)}
								>
									<div className="space-y-2 text-center">
										<div className="font-bold text-2xl text-foreground">
											{cards.length}
										</div>
										<div className="text-muted-foreground text-sm">
											Cards Displayed
										</div>
									</div>
									<div className="space-y-2 text-center">
										<div className="font-bold text-2xl text-foreground">
											{totalCards}
										</div>
										<div className="text-muted-foreground text-sm">
											Total Available
										</div>
									</div>
									<div className="space-y-2 text-center">
										<div className="font-bold text-2xl text-foreground">
											{cards.length > 0
												? (
														cards.reduce(
															(sum, card) => sum + card.overAllRating,
															0,
														) / cards.length
													).toFixed(1)
												: "0"}
										</div>
										<div className="text-muted-foreground text-sm">
											Average Rating
										</div>
									</div>
								</div>
							</ErrorBoundary>
						)}
					</div>

					{/* Floating Action Button */}
					<div className="fixed right-6 bottom-6 z-50">
						<button
							onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
							className={cn(
								"flex h-12 w-12 items-center justify-center rounded-full",
								"transition-all duration-300 hover:scale-110",
								glassmorphism.button,
								"border border-white/20 dark:border-white/10",
								"shadow-2xl hover:shadow-3xl",
								"group",
							)}
						>
							<svg
								className="h-6 w-6 text-foreground transition-colors duration-300 group-hover:text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 10l7-7m0 0l7 7m-7-7v18"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Custom Styles */}
				<style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes glow {
            from { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
            to { box-shadow: 0 0 30px rgba(255, 255, 255, 0.2); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
          }

          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }

          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
        `}</style>
			</div>
		</ErrorBoundary>
	);
}
