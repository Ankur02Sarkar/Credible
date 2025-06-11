"use client";

import { useCallback, useEffect, useState } from "react";
import CardComparison from "~/components/ai-chat/CardComparison";
import { ChatInterface } from "~/components/ai-chat/ChatInterface";
import { SearchInterface } from "~/components/ai-chat/SearchInterface";
import { CreditCardGrid } from "~/components/credit-cards/CreditCardGrid";
import { FilterContainer } from "~/components/filters/FilterContainer";
import {
	ErrorBoundary,
	SimpleErrorFallback,
} from "~/components/ui/error-boundary";
import { type QueryResult, geminiService } from "~/lib/ai/gemini-service";
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
	const [allCards, setAllCards] = useState<CreditCard[]>([]);
	const [features, setFeatures] = useState<CardFeature[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [totalCards, setTotalCards] = useState(0);

	// AI-related state
	const [aiQuery, setAiQuery] = useState<string>("");
	const [aiResults, setAiResults] = useState<QueryResult | null>(null);
	const [aiLoading, setAiLoading] = useState(false);
	const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
	const [recentQueries, setRecentQueries] = useState<string[]>([]);
	const [selectedCards, setSelectedCards] = useState<CreditCard[]>([]);
	const [showComparison, setShowComparison] = useState(false);
	const [isAiMode, setIsAiMode] = useState(false);

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

	// AI query processing using semantic search
	const handleAiQuery = useCallback(
		async (query: string) => {
			setAiLoading(true);
			setAiQuery(query);
			setIsAiMode(true);

			try {
				// Use the semantic search API
				const response = await fetch("/api/search", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query,
						limit: 20,
						threshold: 0.6, // Lower threshold for more results
					}),
				});

				if (!response.ok) {
					throw new Error(`Search failed with status ${response.status}`);
				}

				const searchResult = await response.json();

				// Transform search results to match expected format
				const result: QueryResult = {
					query,
					filteredCards: searchResult.results || [],
					explanation:
						searchResult.searchType === "semantic"
							? `Found ${searchResult.totalResults} cards using AI semantic search with ${Math.round((searchResult.results[0]?.similarity || 0) * 100)}% relevance.`
							: `Found ${searchResult.totalResults} cards using keyword search.`,
					confidence:
						searchResult.searchType === "semantic"
							? Math.round((searchResult.results[0]?.similarity || 0.5) * 100)
							: 70,
				};

				setAiResults(result);
				setCards(result.filteredCards);

				// Update features from the search results
				const searchFeatures = searchResult.results.flatMap(
					(card: any) => card.features || [],
				);
				setFeatures(searchFeatures);

				// Add to recent queries
				const updatedRecent = [
					query,
					...recentQueries.filter((q) => q !== query),
				].slice(0, 5);
				setRecentQueries(updatedRecent);
				localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
			} catch (err) {
				console.error("AI query failed:", err);
				setError("AI search failed. Please try again.");
			} finally {
				setAiLoading(false);
			}
		},
		[recentQueries],
	);

	// Handle card selection for comparison
	const toggleCardSelection = useCallback((card: CreditCard) => {
		setSelectedCards((prev) => {
			const isSelected = prev.some((c) => c.cardID === card.cardID);
			if (isSelected) {
				return prev.filter((c) => c.cardID !== card.cardID);
			} else if (prev.length < 3) {
				return [...prev, card];
			}
			return prev;
		});
	}, []);

	// Reset to normal mode
	const resetToNormalMode = useCallback(() => {
		setIsAiMode(false);
		setAiResults(null);
		setAiQuery("");
		setError(null);
		// Refresh cards from the database
		fetchCards(filters, false);
	}, [filters, fetchCards]);

	// Initial load and setup
	useEffect(() => {
		fetchCards(filters, false);

		// Load recent queries from localStorage
		const stored = localStorage.getItem("recentSearches");
		if (stored) {
			try {
				setRecentQueries(JSON.parse(stored));
			} catch (e) {
				console.error("Failed to parse recent searches:", e);
			}
		}
	}, []); // Empty dependency array for initial load only

	// Set allCards when cards are loaded
	useEffect(() => {
		if (cards.length > 0 && !isAiMode) {
			setAllCards(cards);
		}
	}, [cards, isAiMode]);

	// Generate suggested queries when cards are loaded
	useEffect(() => {
		const generateSuggestions = async () => {
			if (cards.length > 0) {
				try {
					const suggestions = await geminiService.generateSuggestedQueries();
					setSuggestedQueries(suggestions);
				} catch (error) {
					console.error("Failed to generate suggestions:", error);
					// Fallback suggestions
					setSuggestedQueries([
						"Best travel credit cards with lounge access",
						"Cards with no annual fee for beginners",
						"Premium cards for high income earners",
						"Best cashback cards for fuel and dining",
						"Credit cards with instant approval",
					]);
				}
			}
		};

		generateSuggestions();
	}, [cards.length]);

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
					{/* Header */}
					<div
						className={cn(
							"sticky top-0 z-50 border-white/10 border-b p-4 dark:border-white/5",
							glassmorphism.nav,
							"backdrop-blur-xl",
						)}
					>
						<div className="mx-auto max-w-7xl">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold text-2xl text-transparent">
										Credit Cards
									</h1>
									<p className="text-muted-foreground text-sm">
										Find the perfect credit card for your needs
									</p>
								</div>

								{totalCards > 0 && (
									<div
										className={cn(
											"rounded-xl px-4 py-2",
											glassmorphism.card,
											"border border-white/10 dark:border-white/5",
										)}
									>
										<div className="text-muted-foreground text-sm">
											Total Cards
										</div>
										<div className="font-semibold text-foreground text-lg">
											{totalCards}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="mx-auto max-w-7xl space-y-8 p-4">
						{/* AI Search Section */}
						<ErrorBoundary
							fallback={({ resetError }) => (
								<SimpleErrorFallback
									message="Failed to load AI search"
									onRetry={resetError}
								/>
							)}
						>
							<div className="pt-4">
								<SearchInterface
									onSearch={handleAiQuery}
									suggestedQueries={suggestedQueries}
									recentQueries={recentQueries}
									loading={aiLoading}
									className="fade-in-0 slide-in-from-top-4 animate-in duration-700"
								/>
							</div>
						</ErrorBoundary>

						{/* AI Results Banner */}
						{aiResults && isAiMode && (
							<div
								className={cn(
									"rounded-xl p-4",
									"bg-gradient-to-r from-purple-500/10 to-blue-500/10",
									"border border-purple-500/20",
									"fade-in-0 slide-in-from-top-4 animate-in duration-500",
								)}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h3 className="mb-2 font-semibold text-foreground">
											AI Search Results for: "{aiQuery}"
										</h3>
										<p className="mb-2 text-muted-foreground text-sm">
											{aiResults.explanation}
										</p>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground text-xs">
												Confidence:
											</span>
											<div className="h-2 w-20 overflow-hidden rounded-full bg-white/10 dark:bg-black/20">
												<div
													className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
													style={{ width: `${aiResults.confidence}%` }}
												/>
											</div>
											<span className="font-medium text-foreground text-xs">
												{aiResults.confidence}%
											</span>
										</div>
									</div>
									<button
										onClick={resetToNormalMode}
										className={cn(
											"rounded-lg px-3 py-1.5 font-medium text-xs",
											"transition-all duration-200",
											glassmorphism.button,
											"border border-white/10 dark:border-white/5",
											"hover:bg-white/10 dark:hover:bg-black/20",
										)}
									>
										Clear Search
									</button>
								</div>
							</div>
						)}

						{/* Card Comparison Selection */}
						{selectedCards.length > 0 && (
							<div
								className={cn(
									"rounded-xl p-4",
									glassmorphism.card,
									"border border-blue-500/20",
									"fade-in-0 slide-in-from-bottom-4 animate-in duration-500",
								)}
							>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold text-foreground">
											Selected for Comparison ({selectedCards.length}/3)
										</h3>
										<p className="text-muted-foreground text-sm">
											{selectedCards.map((c) => c.cardName).join(", ")}
										</p>
									</div>
									<div className="flex gap-2">
										{selectedCards.length >= 2 && (
											<button
												onClick={() => setShowComparison(true)}
												className={cn(
													"rounded-lg px-4 py-2 font-medium",
													"bg-gradient-to-r from-blue-600 to-purple-600",
													"hover:from-blue-500 hover:to-purple-500",
													"text-white transition-all duration-200",
												)}
											>
												Compare Cards
											</button>
										)}
										<button
											onClick={() => setSelectedCards([])}
											className={cn(
												"rounded-lg px-3 py-2 text-sm",
												glassmorphism.button,
												"border border-white/10 dark:border-white/5",
												"hover:bg-white/10 dark:hover:bg-black/20",
											)}
										>
											Clear
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Traditional Filters Section */}
						{!isAiMode && (
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
						)}

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
									loading={loading || aiLoading}
									error={error}
									onLoadMore={!isAiMode ? handleLoadMore : undefined}
									hasMore={!isAiMode && hasMore}
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

				{/* AI Chat Interface */}
				<ChatInterface
					onQuery={handleAiQuery}
					suggestedQueries={suggestedQueries}
					loading={aiLoading}
				/>

				{/* Card Comparison Modal */}
				{showComparison && selectedCards.length >= 2 && (
					<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
						<div className="max-h-[90vh] w-full max-w-4xl overflow-auto">
							<CardComparison
								cards={selectedCards}
								features={features}
								onClose={() => setShowComparison(false)}
							/>
						</div>
					</div>
				)}

				{/* Custom Styles */}
				<style jsx global>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes glow {
            from {
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
            }
            to {
              box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
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
