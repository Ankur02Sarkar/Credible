"use client";

import {
	AlertTriangle,
	CheckCircle,
	Info,
	Loader2,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { type CardSummary, geminiService } from "~/lib/ai/gemini-service";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";
import type { CardFeature, CreditCard } from "~/types/credit-card";

interface CardSummaryProps {
	card: CreditCard;
	features: CardFeature[];
	className?: string;
}

export function CardSummaryComponent({
	card,
	features,
	className,
}: CardSummaryProps) {
	const [summary, setSummary] = useState<CardSummary | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		generateSummary();
	}, [card.cardID]);

	const generateSummary = async () => {
		setLoading(true);
		setError(null);

		try {
			const cardSummary = await geminiService.generateCardSummary(
				card,
				features,
			);
			setSummary(cardSummary);
		} catch (err) {
			console.error("Error generating card summary:", err);
			setError("Failed to generate AI summary");

			// Fallback summary
			const fallback: CardSummary = {
				cardId: card.cardID,
				summary: `${card.cardName} offers ${card.rewardRate} rewards and is designed for ${card.bestFor.toLowerCase()}. With a minimum income requirement of ₹${card.minMonthlyIncome.toLocaleString()}, this ${card.cardType.toLowerCase()} provides excellent value.`,
				keyBenefits: features.slice(0, 5).map((f) => f.heading),
				bestFor: [card.bestFor, card.employmentType],
			};
			setSummary(fallback);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div
				className={cn(
					"rounded-xl p-4",
					glassmorphism.card,
					"border border-white/10 dark:border-white/5",
					className,
				)}
			>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin text-blue-400" />
						<Sparkles className="h-4 w-4 animate-pulse text-purple-400" />
					</div>
					<div className="flex-1">
						<div className="mb-2 h-3 animate-pulse rounded bg-white/10 dark:bg-black/20" />
						<div className="h-3 w-3/4 animate-pulse rounded bg-white/10 dark:bg-black/20" />
					</div>
				</div>
				<p className="mt-2 text-muted-foreground text-xs">
					Generating AI summary...
				</p>
			</div>
		);
	}

	if (error && !summary) {
		return (
			<div
				className={cn(
					"rounded-xl border border-red-500/20 bg-red-500/5 p-4",
					className,
				)}
			>
				<div className="flex items-center gap-2 text-red-400">
					<AlertTriangle className="h-4 w-4" />
					<span className="font-medium text-sm">AI Summary Unavailable</span>
				</div>
				<button
					onClick={generateSummary}
					className="mt-2 text-red-300 text-xs hover:text-red-200"
				>
					Try again
				</button>
			</div>
		);
	}

	if (!summary) return null;

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-xl",
				glassmorphism.card,
				glassGradients.card,
				"border border-white/10 dark:border-white/5",
				"transition-all duration-300 hover:shadow-lg",
				className,
			)}
		>
			{/* AI Badge */}
			<div className="absolute top-3 right-3 z-10">
				<div
					className={cn(
						"flex items-center gap-1 rounded-full px-2 py-1 font-medium text-xs",
						"bg-gradient-to-r from-purple-500/20 to-blue-500/20",
						"border border-purple-500/30",
						"text-purple-300",
					)}
				>
					<Sparkles className="h-3 w-3 animate-pulse" />
					<span>AI</span>
				</div>
			</div>

			<div className="space-y-4 p-4">
				{/* Main Summary */}
				<div className="pr-12">
					<h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground text-sm">
						<Info className="h-4 w-4 text-blue-400" />
						AI Summary
					</h4>
					<p className="text-muted-foreground text-sm leading-relaxed">
						{summary.summary}
					</p>
				</div>

				{/* Key Benefits */}
				{summary.keyBenefits.length > 0 && (
					<div>
						<h5 className="mb-2 flex items-center gap-2 font-medium text-foreground text-xs">
							<CheckCircle className="h-3 w-3 text-green-400" />
							Key Benefits
						</h5>
						<div className="flex flex-wrap gap-1.5">
							{summary.keyBenefits
								.slice(0, isExpanded ? undefined : 4)
								.map((benefit, index) => (
									<span
										key={index}
										className={cn(
											"rounded-md px-2 py-1 font-medium text-xs",
											"border border-green-500/20 bg-green-500/10 text-green-300",
											"transition-all duration-200 hover:scale-105",
										)}
									>
										{benefit}
									</span>
								))}
							{!isExpanded && summary.keyBenefits.length > 4 && (
								<button
									onClick={() => setIsExpanded(true)}
									className={cn(
										"rounded-md px-2 py-1 font-medium text-xs",
										"border border-white/10 bg-white/5 text-muted-foreground",
										"transition-all duration-200 hover:bg-white/10",
									)}
								>
									+{summary.keyBenefits.length - 4} more
								</button>
							)}
						</div>
					</div>
				)}

				{/* Best For */}
				{summary.bestFor.length > 0 && (
					<div>
						<h5 className="mb-2 flex items-center gap-2 font-medium text-foreground text-xs">
							<TrendingUp className="h-3 w-3 text-blue-400" />
							Best For
						</h5>
						<div className="flex flex-wrap gap-1.5">
							{summary.bestFor.map((category, index) => (
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
				{summary.warnings && summary.warnings.length > 0 && (
					<div>
						<h5 className="mb-2 flex items-center gap-2 font-medium text-foreground text-xs">
							<AlertTriangle className="h-3 w-3 text-yellow-400" />
							Important Notes
						</h5>
						<div className="space-y-1">
							{summary.warnings.map((warning, index) => (
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

				{/* Confidence Indicator */}
				<div className="border-white/10 border-t pt-2 dark:border-white/5">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">AI Confidence</span>
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10 dark:bg-black/20">
								<div
									className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
									style={{ width: "85%" }}
								/>
							</div>
							<span className="font-medium text-foreground">85%</span>
						</div>
					</div>
				</div>

				{/* Regenerate Button */}
				{error && (
					<button
						onClick={generateSummary}
						disabled={loading}
						className={cn(
							"w-full rounded-lg px-3 py-2 font-medium text-xs",
							"transition-all duration-200",
							glassmorphism.button,
							"border border-white/10 dark:border-white/5",
							"hover:bg-white/10 dark:hover:bg-black/20",
							"disabled:cursor-not-allowed disabled:opacity-50",
							"flex items-center justify-center gap-2",
						)}
					>
						{loading ? (
							<>
								<Loader2 className="h-3 w-3 animate-spin" />
								Regenerating...
							</>
						) : (
							<>
								<Sparkles className="h-3 w-3" />
								Regenerate Summary
							</>
						)}
					</button>
				)}
			</div>

			{/* Decorative Elements */}
			<div className="absolute right-0 bottom-0 h-20 w-20 rounded-tl-full bg-gradient-to-tl from-purple-500/5 to-transparent" />
			<div className="absolute top-0 left-0 h-16 w-16 rounded-br-full bg-gradient-to-br from-blue-500/5 to-transparent" />
		</div>
	);
}

export default CardSummaryComponent;
