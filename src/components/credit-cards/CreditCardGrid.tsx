"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Grid, List } from "lucide-react";
import { CreditCardItem } from "./CreditCardItem";
import { LoadingGrid } from "~/components/ui/loading-skeleton";
import { cn, glassmorphism, glassGradients } from "~/lib/glassmorphism";
import type { CreditCard, CardFeature } from "~/types/credit-card";

interface CreditCardGridProps {
  cards: CreditCard[];
  features: CardFeature[];
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  className?: string;
}

export function CreditCardGrid({
  cards,
  features,
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  className,
}: CreditCardGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Animate cards on load
    const timer = setTimeout(() => {
      const newAnimatedCards = new Set(cards.map(card => card.cardID));
      setAnimatedCards(newAnimatedCards);
    }, 100);

    return () => clearTimeout(timer);
  }, [cards]);

  const handleViewDetails = (cardId: string) => {
    console.log('View details for card:', cardId);
    // Implement navigation to card details page
  };

  if (loading && cards.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className={cn(
          "flex items-center justify-between p-4 rounded-xl",
          glassmorphism.filter,
          "border border-white/10 dark:border-white/5"
        )}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Loading Credit Cards...
            </h2>
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        </div>
        <LoadingGrid count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center py-20",
        glassmorphism.container,
        "rounded-2xl border border-red-500/20",
        "bg-red-500/5",
        className
      )}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div className="space-y-2">
            <p className="text-red-400 font-medium">Error loading credit cards</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center py-20",
        glassmorphism.container,
        "rounded-2xl border border-white/10 dark:border-white/5",
        className
      )}>
        <div className="text-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full mx-auto flex items-center justify-center",
            glassmorphism.card,
            "border border-white/20 dark:border-white/10"
          )}>
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">No credit cards found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters to see more results
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with view toggle */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-xl",
        glassmorphism.filter,
        "border border-white/10 dark:border-white/5"
      )}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Credit Cards
          </h2>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          )}>
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className={cn(
          "flex items-center rounded-lg p-1",
          glassmorphism.button,
          "border border-white/10 dark:border-white/5"
        )}>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-md transition-all duration-200",
              viewMode === 'grid' 
                ? "bg-blue-500/20 text-blue-300" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-md transition-all duration-200",
              viewMode === 'list' 
                ? "bg-blue-500/20 text-blue-300" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={cn(
        "grid gap-6 transition-all duration-500",
        viewMode === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      )}>
        {cards.map((card, index) => (
          <div
            key={card.cardID}
            className={cn(
              "transition-all duration-700 transform",
              animatedCards.has(card.cardID)
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            )}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <CreditCardItem
              card={card}
              features={features}
              onViewDetails={handleViewDetails}
              className={cn(
                viewMode === 'list' && "md:flex md:flex-row md:items-center"
              )}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={cn(
              "px-8 py-4 rounded-xl font-medium transition-all duration-300",
              "flex items-center gap-3",
              glassmorphism.button,
              "border border-white/20 dark:border-white/10",
              "hover:bg-white/10 dark:hover:bg-black/20",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transform hover:scale-105 active:scale-95"
            )}
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more cards...</span>
              </>
            ) : (
              <span>Load More Cards</span>
            )}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-xl",
            glassmorphism.card,
            "border border-white/10 dark:border-white/5"
          )}>
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm text-muted-foreground">
              Loading more cards...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}