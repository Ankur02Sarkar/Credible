"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCardGrid } from "~/components/credit-cards/CreditCardGrid";
import { FilterContainer } from "~/components/filters/FilterContainer";
import { ChatInterface } from "~/components/ai-chat/ChatInterface";
import { SearchInterface } from "~/components/ai-chat/SearchInterface";
import CardComparison from "~/components/ai-chat/CardComparison";
import {
	ErrorBoundary,
	SimpleErrorFallback,
} from "~/components/ui/error-boundary";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";
import { geminiService, type QueryResult } from "~/lib/ai/gemini-service";
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

  // AI query processing
  const handleAiQuery = useCallback(async (query: string) => {
    setAiLoading(true);
    setAiQuery(query);
    setIsAiMode(true);
    
    try {
      const result = await geminiService.processNaturalLanguageQuery(
        query,
        allCards.length > 0 ? allCards : cards,
        features
      );
      
      setAiResults(result);
      setCards(result.filteredCards);
      
      // Add to recent queries
      const updatedRecent = [query, ...recentQueries.filter(q => q !== query)].slice(0, 5);
      setRecentQueries(updatedRecent);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      
    } catch (err) {
      console.error('AI query failed:', err);
      setError('AI search failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }, [allCards, cards, features, recentQueries]);

  // Handle card selection for comparison
  const toggleCardSelection = useCallback((card: CreditCard) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.cardID === card.cardID);
      if (isSelected) {
        return prev.filter(c => c.cardID !== card.cardID);
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
    setCards(allCards);
    setError(null);
  }, [allCards]);

  // Initial load and setup
  useEffect(() => {
    fetchCards(filters, false);
    
    // Load recent queries from localStorage
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentQueries(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []); // Empty dependency array for initial load only

  // Generate suggested queries when cards are loaded
  useEffect(() => {
    if (allCards.length > 0 && features.length > 0) {
      const suggestions = geminiService.generateSuggestedQueries(allCards, features);
      setSuggestedQueries(suggestions);
    }
  }, [allCards, features]);

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
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className={cn(
            "sticky top-0 z-50 p-4 border-b border-white/10 dark:border-white/5",
            glassmorphism.nav,
            "backdrop-blur-xl"
          )}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Credit Cards
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Find the perfect credit card for your needs
                  </p>
                </div>
                
                {totalCards > 0 && (
                  <div className={cn(
                    "px-4 py-2 rounded-xl",
                    glassmorphism.card,
                    "border border-white/10 dark:border-white/5"
                  )}>
                    <div className="text-sm text-muted-foreground">Total Cards</div>
                    <div className="text-lg font-semibold text-foreground">{totalCards}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-4 space-y-8">
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
                  className="animate-in fade-in-0 slide-in-from-top-4 duration-700"
                />
              </div>
            </ErrorBoundary>

            {/* AI Results Banner */}
            {aiResults && isAiMode && (
              <div className={cn(
                "p-4 rounded-xl",
                "bg-gradient-to-r from-purple-500/10 to-blue-500/10",
                "border border-purple-500/20",
                "animate-in fade-in-0 slide-in-from-top-4 duration-500"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      AI Search Results for: "{aiQuery}"
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {aiResults.explanation}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <div className="w-20 h-2 bg-white/10 dark:bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                          style={{ width: `${aiResults.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground font-medium">{aiResults.confidence}%</span>
                    </div>
                  </div>
                  <button
                    onClick={resetToNormalMode}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium",
                      "transition-all duration-200",
                      glassmorphism.button,
                      "border border-white/10 dark:border-white/5",
                      "hover:bg-white/10 dark:hover:bg-black/20"
                    )}
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}

            {/* Card Comparison Selection */}
            {selectedCards.length > 0 && (
              <div className={cn(
                "p-4 rounded-xl",
                glassmorphism.card,
                "border border-blue-500/20",
                "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Selected for Comparison ({selectedCards.length}/3)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCards.map(c => c.cardName).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedCards.length >= 2 && (
                      <button
                        onClick={() => setShowComparison(true)}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium",
                          "bg-gradient-to-r from-blue-600 to-purple-600",
                          "hover:from-blue-500 hover:to-purple-500",
                          "text-white transition-all duration-200"
                        )}
                      >
                        Compare Cards
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedCards([])}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm",
                        glassmorphism.button,
                        "border border-white/10 dark:border-white/5",
                        "hover:bg-white/10 dark:hover:bg-black/20"
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
                    className="animate-in fade-in-0 slide-in-from-top-4 duration-700"
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
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
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
                <div className={cn(
                  "grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl",
                  glassmorphism.container,
                  glassGradients.card,
                  "border border-white/10 dark:border-white/5",
                  "animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500"
                )}>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-foreground">{cards.length}</div>
                    <div className="text-sm text-muted-foreground">Cards Displayed</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-foreground">{totalCards}</div>
                    <div className="text-sm text-muted-foreground">Total Available</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                      {cards.length > 0 ? (cards.reduce((sum, card) => sum + card.overAllRating, 0) / cards.length).toFixed(1) : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </ErrorBoundary>
            )}
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                "transition-all duration-300 hover:scale-110",
                glassmorphism.button,
                "border border-white/20 dark:border-white/10",
                "shadow-2xl hover:shadow-3xl",
                "group"
              )}
            >
              <svg 
                className="w-6 h-6 text-foreground group-hover:text-blue-400 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
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
