"use client";

import {
	Calendar,
	Car,
	CreditCard as CreditCardIcon,
	Eye,
	Gift,
	Plane,
	Shield,
	ShoppingBag,
	Star,
	Trophy,
	Utensils,
	Zap,
} from "lucide-react";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { RatingDisplay } from "~/components/ui/rating-stars";
import { type CardSummary, geminiService } from "~/lib/ai/gemini-service";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";
import type { CardFeature, CreditCard } from "~/types/credit-card";

interface CreditCardItemProps {
	card: CreditCard;
	features: CardFeature[];
	className?: string;
	onViewDetails?: (cardId: string) => void;
	isSelected?: boolean;
	onSelect?: (card: CreditCard) => void;
	showSelection?: boolean;
}

const FEATURE_ICONS: Record<
	string,
	React.ComponentType<{ className?: string }>
> = {
	"Reward Points": Trophy,
	"Travel Benefit": Plane,
	"Dining Benefit": Utensils,
	"Fuel Surcharge": Car,
	"Shopping Benefit": ShoppingBag,
	"Lounge Access": Shield,
	"Welcome Bonus": Gift,
	"Insurance Benefit": Shield,
	"Entertainment Benefit": Zap,
	"Cashback Benefit": CreditCardIcon,
	"EMI Benefit": Calendar,
	"Other Benefit": Star,
	"Zero Lost Card Liability": Shield,
	"Milestone Benefit": Trophy,
	"Cash Withdrawal Benefit": CreditCardIcon,
	"Concierge Services": Shield,
	"Interest-Free Period": Calendar,
	"Revolving Credit": CreditCardIcon,
};

const BEST_FOR_COLORS: Record<string, string> = {
	Lifestyle: "bg-purple-500/20 text-purple-300 border-purple-500/30",
	Travel: "bg-blue-500/20 text-blue-300 border-blue-500/30",
	Rewards: "bg-green-500/20 text-green-300 border-green-500/30",
	Cashback: "bg-orange-500/20 text-orange-300 border-orange-500/30",
	Fuel: "bg-red-500/20 text-red-300 border-red-500/30",
	Shopping: "bg-pink-500/20 text-pink-300 border-pink-500/30",
	Dining: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

// Cache for AI summaries to avoid regenerating
const summaryCache = new Map<string, CardSummary>();

export function CreditCardItem({
	card,
	features,
	className,
	onViewDetails,
	isSelected = false,
	onSelect,
	showSelection = false,
}: CreditCardItemProps) {
	const cardFeatures = features.filter(
		(feature) => feature.cardID === card.cardID,
	);

	// AI Summary state
	const [isAiExpanded, setIsAiExpanded] = useState(false);
	const [aiSummary, setAiSummary] = useState<CardSummary | null>(
		summaryCache.get(card.cardID) || null,
	);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState<string | null>(null);

	const formatRating = (rating: number) => {
		return rating.toFixed(1);
	};

	const formatStats = (count: number) => {
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}k`;
		}
		return count.toString();
	};

	const bestForColor =
		BEST_FOR_COLORS[card.bestFor] ||
		"bg-gray-500/20 text-gray-300 border-gray-500/30";

	const handleAiToggle = async () => {
		if (!isAiExpanded) {
			setIsAiExpanded(true);

			// Check cache first
			if (summaryCache.has(card.cardID)) {
				setAiSummary(summaryCache.get(card.cardID)!);
				return;
			}

			// Generate new summary
			setAiLoading(true);
			setAiError(null);

			try {
				const summary = await geminiService.generateCardSummary(card, features);
				setAiSummary(summary);
				// Cache the result
				summaryCache.set(card.cardID, summary);
			} catch (error) {
				console.error("Error generating AI summary:", error);
				setAiError("Failed to generate AI summary");

				// Fallback summary
				const fallback: CardSummary = {
					cardId: card.cardID,
					summary: `${card.cardName} offers ${card.rewardRate} rewards and is designed for ${card.bestFor.toLowerCase()}. With a minimum income requirement of ₹${card.minMonthlyIncome.toLocaleString()}, this ${card.cardType.toLowerCase()} provides excellent value.`,
					keyBenefits: cardFeatures.slice(0, 5).map((f) => f.heading),
					bestFor: [card.bestFor, card.employmentType],
				};
				setAiSummary(fallback);
				summaryCache.set(card.cardID, fallback);
			} finally {
				setAiLoading(false);
			}
		} else {
			setIsAiExpanded(false);
		}
	};

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-2xl",
				"transition-all duration-500 hover:scale-[1.02]",
				glassmorphism.card,
				glassmorphism.cardHover,
				glassGradients.card,
				"shadow-2xl hover:shadow-3xl",
				"border border-white/10 dark:border-white/5",
				className,
			)}
		>
			{/* Background Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/3 dark:to-white/3" />

			{/* Card Header */}
			<div className="relative border-white/10 border-b p-4 sm:p-6 dark:border-white/5">
				<div className="flex items-start gap-3 sm:gap-4">
					{/* Card Image */}
					<div className="relative flex-shrink-0">
						<div
							className={cn(
								"h-8 w-12 overflow-hidden rounded-lg sm:h-10 sm:w-16",
								"ring-2 ring-white/20 dark:ring-white/10",
								"shadow-lg",
							)}
						>
							<Image
								src={
									card.cardImage
										? `https://d3po6s2ufk88fh.cloudfront.net/1000x0/filters:format(webp)/${card.cardImage}`
										: "/placeholder-card.png"
								}
								alt={card.cardName}
								width={64}
								height={40}
								sizes="(max-width: 640px) 48px, 64px"
								className="h-full w-full object-cover"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = "none";
									target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center rounded-lg">
                      <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                    </div>
                  `;
								}}
							/>
						</div>
						{card.isFeatured === 1 && (
							<div className="-top-1 -right-1 absolute h-3 w-3 animate-pulse rounded-full bg-yellow-500" />
						)}
					</div>

					{/* Card Info */}
					<div className="min-w-0 flex-1">
						<h3 className="mb-1 truncate font-semibold text-base text-foreground sm:text-lg">
							{card.cardName}
						</h3>
						<div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
							<RatingDisplay
								rating={card.overAllRating}
								reviews={card.statsCount}
								size="sm"
							/>
							<div className="flex items-center gap-1 text-muted-foreground">
								<Eye className="h-4 w-4" />
								<span className="text-xs sm:text-sm">
									{formatStats(card.statsCount)} views
								</span>
							</div>
						</div>
						<div
							className={cn(
								"inline-flex items-center rounded-full border px-2 py-1 font-medium text-xs",
								"max-w-fit",
								bestForColor,
							)}
						>
							Best For: {card.bestFor}
						</div>
					</div>
				</div>
			</div>

			{/* Card Details */}
			<div className="space-y-4 p-4 sm:p-6">
				{/* Financial Details */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					<div
						className={cn(
							"rounded-xl p-2 sm:p-3",
							glassmorphism.filter,
							"border border-white/10 dark:border-white/5",
						)}
					>
						<div className="mb-1 text-muted-foreground text-xs">
							Reward Rate
						</div>
						<div className="font-semibold text-foreground text-sm sm:text-base">
							{card.rewardRate}
						</div>
					</div>
					<div
						className={cn(
							"rounded-xl p-2 sm:p-3",
							glassmorphism.filter,
							"border border-white/10 dark:border-white/5",
						)}
					>
						<div className="mb-1 text-muted-foreground text-xs">
							Joining Fee
						</div>
						<div className="font-semibold text-foreground text-xs sm:text-sm">
							{card.joiningFee.split("|")[0]?.trim() || card.joiningFee}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					<div
						className={cn(
							"rounded-xl p-2 sm:p-3",
							glassmorphism.filter,
							"border border-white/10 dark:border-white/5",
						)}
					>
						<div className="mb-1 text-muted-foreground text-xs">Annual Fee</div>
						<div className="font-semibold text-foreground text-xs sm:text-sm">
							{card.annualFee.split("|")[0]?.trim() || card.annualFee}
						</div>
					</div>
					<div
						className={cn(
							"rounded-xl p-2 sm:p-3",
							glassmorphism.filter,
							"border border-white/10 dark:border-white/5",
						)}
					>
						<div className="mb-1 text-muted-foreground text-xs">APR</div>
						<div className="font-semibold text-foreground text-xs sm:text-sm">
							{card.annualPercentageRate.split("|")[1]?.trim() ||
								card.annualPercentageRate}
						</div>
					</div>
				</div>

				{/* Features */}
				{cardFeatures.length > 0 && (
					<div className="space-y-3">
						<h4 className="font-medium text-foreground text-sm">
							Key Features
						</h4>
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							{cardFeatures.slice(0, 6).map((feature, index) => {
								const IconComponent = FEATURE_ICONS[feature.heading] || Star;
								return (
									<div
										key={`${feature.cardID}-${feature.heading}-${index}`}
										className={cn(
											"flex items-center gap-1 rounded-lg px-1.5 py-1 sm:gap-1.5 sm:px-2",
											"font-medium text-xs",
											glassmorphism.button,
											"border border-white/15 dark:border-white/8",
											"transition-all duration-200 hover:scale-105",
										)}
									>
										<IconComponent className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
										<span className="truncate text-foreground">
											{feature.heading}
										</span>
									</div>
								);
							})}
							{cardFeatures.length > 6 && (
								<div
									className={cn(
										"flex items-center rounded-lg px-1.5 py-1 sm:px-2",
										"font-medium text-muted-foreground text-xs",
										glassmorphism.button,
										"border border-white/15 dark:border-white/8",
									)}
								>
									+{cardFeatures.length - 6} more
								</div>
							)}
						</div>
					</div>
				)}

				{/* AI Summary Accordion */}
				<div className="border-white/10 border-t pt-4 dark:border-white/5">
					<button
						onClick={handleAiToggle}
						className={cn(
							"flex w-full items-center justify-between rounded-lg p-3",
							"transition-all duration-200",
							glassmorphism.button,
							"border border-white/10 dark:border-white/5",
							"hover:bg-white/10 dark:hover:bg-black/20",
							"group",
						)}
					>
						<div className="flex items-center gap-2">
							<Sparkles className="h-4 w-4 animate-pulse text-purple-400" />
							<span className="font-medium text-foreground text-sm">
								AI Summary
							</span>
							{aiSummary && !aiLoading && (
								<div className="h-2 w-2 rounded-full bg-green-500" />
							)}
						</div>
						<ChevronDown
							className={cn(
								"h-4 w-4 text-muted-foreground transition-transform duration-200",
								isAiExpanded && "rotate-180",
							)}
						/>
					</button>

					{/* AI Summary Content */}
					{isAiExpanded && (
						<div
							className={cn(
								"mt-3 rounded-lg p-4",
								glassmorphism.card,
								"border border-white/10 dark:border-white/5",
								"fade-in-0 slide-in-from-top-2 animate-in duration-300",
							)}
						>
							{aiLoading ? (
								<div className="flex items-center gap-3 py-4 text-center">
									<Loader2 className="h-4 w-4 animate-spin text-blue-400" />
									<span className="text-muted-foreground text-sm">
										Generating AI summary...
									</span>
								</div>
							) : aiError ? (
								<div className="py-4 text-center">
									<p className="mb-2 text-red-400 text-sm">{aiError}</p>
									<button
										onClick={() => {
											setAiError(null);
											handleAiToggle();
										}}
										className="text-blue-400 text-xs hover:text-blue-300"
									>
										Try again
									</button>
								</div>
							) : aiSummary ? (
								<div className="space-y-4">
									{/* Summary Text */}
									<div>
										<h5 className="mb-2 font-medium text-foreground text-sm">
											Summary
										</h5>
										<p className="text-muted-foreground text-xs leading-relaxed">
											{aiSummary.summary}
										</p>
									</div>

									{/* Key Benefits */}
									{aiSummary.keyBenefits.length > 0 && (
										<div>
											<h5 className="mb-2 font-medium text-foreground text-sm">
												Key Benefits
											</h5>
											<div className="flex flex-wrap gap-1.5">
												{aiSummary.keyBenefits
													.slice(0, 4)
													.map((benefit, index) => (
														<span
															key={index}
															className={cn(
																"rounded-md px-2 py-1 font-medium text-xs",
																"border border-green-500/20 bg-green-500/10 text-green-300",
															)}
														>
															{benefit}
														</span>
													))}
											</div>
										</div>
									)}

									{/* Best For */}
									{aiSummary.bestFor.length > 0 && (
										<div>
											<h5 className="mb-2 font-medium text-foreground text-sm">
												Best For
											</h5>
											<div className="flex flex-wrap gap-1.5">
												{aiSummary.bestFor.map((category, index) => (
													<span
														key={index}
														className={cn(
															"rounded-md px-2 py-1 font-medium text-xs",
															"border border-blue-500/20 bg-blue-500/10 text-blue-300",
														)}
													>
														{category}
													</span>
												))}
											</div>
										</div>
									)}

									{/* Warnings */}
									{aiSummary.warnings && aiSummary.warnings.length > 0 && (
										<div>
											<h5 className="mb-2 font-medium text-foreground text-sm">
												Important Notes
											</h5>
											<div className="space-y-1">
												{aiSummary.warnings.map((warning, index) => (
													<p
														key={index}
														className={cn(
															"rounded-md p-2 text-xs",
															"border border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
														)}
													>
														{warning}
													</p>
												))}
											</div>
										</div>
									)}

									{/* AI Badge */}
									<div className="flex items-center justify-between border-white/10 border-t pt-2 dark:border-white/5">
										<div className="flex items-center gap-2 text-muted-foreground text-xs">
											<Sparkles className="h-3 w-3 text-purple-400" />
											<span>Powered by AI</span>
										</div>
										<div className="text-muted-foreground text-xs">
											Confidence: 85%
										</div>
									</div>
								</div>
							) : null}
						</div>
					)}
				</div>

				{/* Card Type & Employment */}
				<div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
					<span className="text-muted-foreground">
						{card.cardType} • {card.employmentType}
					</span>
					<span className="text-muted-foreground">
						Min Income: ₹{(card.minMonthlyIncome / 1000).toFixed(0)}k
					</span>
				</div>
			</div>

			{/* Action Button */}
			<div className="p-4 pt-0 sm:p-6">
				<button
					onClick={() => onViewDetails?.(card.cardID)}
					className={cn(
						"w-full rounded-xl px-4 py-2.5 font-medium text-sm sm:py-3 sm:text-base",
						"transition-all duration-300",
						"bg-gradient-to-r from-blue-600 to-purple-600",
						"hover:from-blue-500 hover:to-purple-500",
						"text-white shadow-lg hover:shadow-xl",
						"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
						"transform hover:scale-[1.02] active:scale-[0.98]",
					)}
				>
					Full Details
				</button>
			</div>

			{/* Floating Elements */}
			<div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
				<div
					className={cn("h-2 w-2 animate-pulse rounded-full bg-green-500")}
				/>
			</div>
		</div>
	);
}
