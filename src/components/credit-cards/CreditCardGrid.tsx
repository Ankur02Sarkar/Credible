"use client";

import { AlertCircle, Grid, List, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingGrid } from "~/components/ui/loading-skeleton";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";
import type { CardFeature, CreditCard } from "~/types/credit-card";
import { CreditCardItem } from "./CreditCardItem";

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
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set());

	useEffect(() => {
		// Animate cards on load
		const timer = setTimeout(() => {
			const newAnimatedCards = new Set(cards.map((card) => card.cardID));
			setAnimatedCards(newAnimatedCards);
		}, 100);

		return () => clearTimeout(timer);
	}, [cards]);

	const handleViewDetails = (cardId: string) => {
		console.log("View details for card:", cardId);
		// Implement navigation to card details page
	};

	if (loading && cards.length === 0) {
		return (
			<div className={cn("space-y-6", className)}>
				<div
					className={cn(
						"flex items-center justify-between rounded-xl p-4",
						glassmorphism.filter,
						"border border-white/10 dark:border-white/5",
					)}
				>
					<div className="flex items-center gap-3">
						<h2 className="font-semibold text-foreground text-lg">
							Loading Credit Cards...
						</h2>
						<Loader2 className="h-5 w-5 animate-spin text-blue-500" />
					</div>
				</div>
				<LoadingGrid count={6} />
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={cn(
					"flex items-center justify-center py-20",
					glassmorphism.container,
					"rounded-2xl border border-red-500/20",
					"bg-red-500/5",
					className,
				)}
			>
				<div className="space-y-4 text-center">
					<AlertCircle className="mx-auto h-8 w-8 text-red-500" />
					<div className="space-y-2">
						<p className="font-medium text-red-400">
							Error loading credit cards
						</p>
						<p className="text-muted-foreground text-sm">{error}</p>
					</div>
				</div>
			</div>
		);
	}

	if (cards.length === 0) {
		return (
			<div
				className={cn(
					"flex items-center justify-center py-20",
					glassmorphism.container,
					"rounded-2xl border border-white/10 dark:border-white/5",
					className,
				)}
			>
				<div className="space-y-4 text-center">
					<div
						className={cn(
							"mx-auto flex h-16 w-16 items-center justify-center rounded-full",
							glassmorphism.card,
							"border border-white/20 dark:border-white/10",
						)}
					>
						<AlertCircle className="h-8 w-8 text-muted-foreground" />
					</div>
					<div className="space-y-2">
						<p className="font-medium text-foreground">No credit cards found</p>
						<p className="text-muted-foreground text-sm">
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
			<div
				className={cn(
					"flex items-center justify-between rounded-xl p-4",
					glassmorphism.filter,
					"border border-white/10 dark:border-white/5",
				)}
			>
				<div className="flex items-center gap-3">
					<h2 className="font-semibold text-foreground text-lg">
						Credit Cards
					</h2>
					<div
						className={cn(
							"rounded-full px-3 py-1 font-medium text-sm",
							"border border-blue-500/30 bg-blue-500/20 text-blue-300",
						)}
					>
						{cards.length} {cards.length === 1 ? "card" : "cards"}
					</div>
				</div>

				{/* View Mode Toggle */}
				<div
					className={cn(
						"flex items-center rounded-lg p-1",
						glassmorphism.button,
						"border border-white/10 dark:border-white/5",
					)}
				>
					<button
						onClick={() => setViewMode("grid")}
						className={cn(
							"rounded-md p-2 transition-all duration-200",
							viewMode === "grid"
								? "bg-blue-500/20 text-blue-300"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<Grid className="h-4 w-4" />
					</button>
					<button
						onClick={() => setViewMode("list")}
						className={cn(
							"rounded-md p-2 transition-all duration-200",
							viewMode === "list"
								? "bg-blue-500/20 text-blue-300"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<List className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Cards Grid */}
			<div
				className={cn(
					"grid gap-6 transition-all duration-500",
					viewMode === "grid"
						? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
						: "grid-cols-1",
				)}
			>
				{cards.map((card, index) => (
					<div
						key={card.cardID}
						className={cn(
							"transform transition-all duration-700",
							animatedCards.has(card.cardID)
								? "translate-y-0 opacity-100"
								: "translate-y-8 opacity-0",
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
								viewMode === "list" && "md:flex md:flex-row md:items-center",
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
							"rounded-xl px-8 py-4 font-medium transition-all duration-300",
							"flex items-center gap-3",
							glassmorphism.button,
							"border border-white/20 dark:border-white/10",
							"hover:bg-white/10 dark:hover:bg-black/20",
							"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
							"disabled:cursor-not-allowed disabled:opacity-50",
							"transform hover:scale-105 active:scale-95",
						)}
					>
						{loadingMore ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin" />
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
					<div
						className={cn(
							"flex items-center gap-3 rounded-xl px-6 py-3",
							glassmorphism.card,
							"border border-white/10 dark:border-white/5",
						)}
					>
						<Loader2 className="h-5 w-5 animate-spin text-blue-500" />
						<span className="text-muted-foreground text-sm">
							Loading more cards...
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
