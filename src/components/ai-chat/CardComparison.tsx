"use client";

import {
	ArrowRight,
	CheckCircle,
	Info,
	Loader2,
	Scale,
	Sparkles,
	TrendingDown,
	TrendingUp,
	XCircle,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RatingDisplay } from "~/components/ui/rating-stars";
import { type ComparisonResult, geminiService } from "~/lib/ai/gemini-service";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";
import type { CardFeature, CreditCard } from "~/types/credit-card";

interface CardComparisonProps {
	cards: CreditCard[];
	features: CardFeature[];
	onClose?: () => void;
	className?: string;
}

export function CardComparison({
	cards,
	features,
	onClose,
	className,
}: CardComparisonProps) {
	const [comparison, setComparison] = useState<ComparisonResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedTab, setSelectedTab] = useState<
		"overview" | "pros-cons" | "details"
	>("overview");

	useEffect(() => {
		if (cards.length >= 2) {
			generateComparison();
		}
	}, [cards]);

	const generateComparison = async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await geminiService.compareCards(cards, features);
			setComparison(result);
		} catch (err) {
			console.error("Error generating comparison:", err);
			setError("Failed to generate AI comparison");

			// Fallback comparison
			const fallback: ComparisonResult = {
				cards,
				comparison: {
					pros: cards.reduce(
						(acc, card) => {
							acc[card.cardName] = [
								`${card.rewardRate} reward rate`,
								`Rated ${card.overAllRating}/5 by users`,
								`Best for ${card.bestFor.toLowerCase()}`,
							];
							return acc;
						},
						{} as Record<string, string[]>,
					),
					cons: cards.reduce(
						(acc, card) => {
							acc[card.cardName] = [
								`${card.joiningFee.split("|")[0]?.trim()} joining fee`,
								`₹${card.minMonthlyIncome.toLocaleString()} minimum income required`,
							];
							return acc;
						},
						{} as Record<string, string[]>,
					),
					bestFor: cards.reduce(
						(acc, card) => {
							acc[card.cardName] = card.bestFor;
							return acc;
						},
						{} as Record<string, string>,
					),
					recommendation:
						"Choose based on your spending patterns, income level, and preferred benefits.",
				},
			};
			setComparison(fallback);
		} finally {
			setLoading(false);
		}
	};

	if (cards.length < 2) {
		return (
			<div
				className={cn(
					"rounded-xl p-8 text-center",
					glassmorphism.card,
					"border border-white/10 dark:border-white/5",
					className,
				)}
			>
				<Scale className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-foreground text-lg">
					Card Comparison
				</h3>
				<p className="text-muted-foreground text-sm">
					Select at least 2 cards to compare them side by side.
				</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				className={cn(
					"rounded-xl p-8 text-center",
					glassmorphism.card,
					glassGradients.card,
					"border border-white/10 dark:border-white/5",
					className,
				)}
			>
				<div className="mb-4 flex items-center justify-center gap-3">
					<Loader2 className="h-6 w-6 animate-spin text-blue-400" />
					<Sparkles className="h-6 w-6 animate-pulse text-purple-400" />
				</div>
				<h3 className="mb-2 font-semibold text-foreground text-lg">
					Analyzing Cards
				</h3>
				<p className="text-muted-foreground text-sm">
					Our AI is comparing {cards.length} cards to provide detailed
					insights...
				</p>
				<div className="mx-auto mt-4 max-w-sm">
					<div className="h-2 overflow-hidden rounded-full bg-white/10 dark:bg-black/20">
						<div className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
					</div>
				</div>
			</div>
		);
	}

	if (error && !comparison) {
		return (
			<div
				className={cn(
					"rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center",
					className,
				)}
			>
				<XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
				<h3 className="mb-2 font-semibold text-lg text-red-300">
					Comparison Failed
				</h3>
				<p className="mb-4 text-red-200 text-sm">
					Unable to generate AI comparison at the moment.
				</p>
				<button
					onClick={generateComparison}
					className={cn(
						"rounded-lg px-4 py-2 font-medium text-sm",
						"bg-red-600 text-white hover:bg-red-500",
						"transition-all duration-200",
					)}
				>
					Try Again
				</button>
			</div>
		);
	}

	if (!comparison) return null;

	const { cards: comparedCards, comparison: comparisonData } = comparison;

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-2xl",
				glassmorphism.modal,
				glassGradients.card,
				"border border-white/10 dark:border-white/5",
				"shadow-2xl",
				className,
			)}
		>
			{/* Header */}
			<div
				className={cn(
					"border-white/10 border-b p-6 dark:border-white/5",
					glassmorphism.nav,
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-full",
								"bg-gradient-to-r from-purple-500/20 to-blue-500/20",
								"border border-purple-500/30",
							)}
						>
							<Scale className="h-5 w-5 text-purple-300" />
						</div>
						<div>
							<h2 className="font-bold text-foreground text-xl">
								AI Card Comparison
							</h2>
							<p className="text-muted-foreground text-sm">
								Comparing {comparedCards.length} credit cards
							</p>
						</div>
					</div>

					{onClose && (
						<button
							onClick={onClose}
							className={cn(
								"rounded-lg p-2 transition-all duration-200",
								"hover:bg-white/10 dark:hover:bg-black/20",
								"text-muted-foreground hover:text-foreground",
							)}
						>
							<XCircle className="h-5 w-5" />
						</button>
					)}
				</div>

				{/* Tabs */}
				<div className="mt-4 flex gap-2">
					{[
						{ id: "overview", label: "Overview", icon: Info },
						{ id: "pros-cons", label: "Pros & Cons", icon: Scale },
						{ id: "details", label: "Details", icon: Zap },
					].map(({ id, label, icon: Icon }) => (
						<button
							key={id}
							onClick={() => setSelectedTab(id as any)}
							className={cn(
								"flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm",
								"transition-all duration-200",
								selectedTab === id
									? "border border-blue-500/30 bg-blue-500/20 text-blue-300"
									: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
							)}
						>
							<Icon className="h-4 w-4" />
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="scrollbar-thin max-h-96 overflow-y-auto p-6">
				{selectedTab === "overview" && (
					<div className="space-y-6">
						{/* AI Recommendation */}
						<div
							className={cn(
								"rounded-xl p-4",
								"bg-gradient-to-r from-purple-500/10 to-blue-500/10",
								"border border-purple-500/20",
							)}
						>
							<div className="flex items-start gap-3">
								<Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
								<div>
									<h3 className="mb-2 font-semibold text-foreground">
										AI Recommendation
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{comparisonData.recommendation}
									</p>
								</div>
							</div>
						</div>

						{/* Cards Overview */}
						<div className="grid gap-4">
							{comparedCards.map((card, index) => (
								<div
									key={card.cardID}
									className={cn(
										"rounded-xl p-4",
										glassmorphism.card,
										"border border-white/10 dark:border-white/5",
									)}
								>
									<div className="mb-3 flex items-center justify-between">
										<h4 className="font-semibold text-foreground">
											{card.cardName}
										</h4>
										<div
											className={cn(
												"rounded-full px-2 py-1 font-medium text-xs",
												index === 0
													? "border border-gold-500/30 bg-gold-500/20 text-gold-300"
													: "border border-gray-500/30 bg-gray-500/20 text-gray-300",
											)}
										>
											{comparisonData.bestFor[card.cardName] || card.bestFor}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Rating: </span>
											<RatingDisplay rating={card.overAllRating} size="sm" />
										</div>
										<div>
											<span className="text-muted-foreground">
												Reward Rate:{" "}
											</span>
											<span className="font-medium text-foreground">
												{card.rewardRate}
											</span>
										</div>
										<div>
											<span className="text-muted-foreground">
												Joining Fee:{" "}
											</span>
											<span className="text-foreground">
												{card.joiningFee.split("|")[0]?.trim()}
											</span>
										</div>
										<div>
											<span className="text-muted-foreground">
												Min Income:{" "}
											</span>
											<span className="text-foreground">
												₹{card.minMonthlyIncome.toLocaleString()}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{selectedTab === "pros-cons" && (
					<div className="space-y-6">
						{comparedCards.map((card) => (
							<div
								key={card.cardID}
								className={cn(
									"rounded-xl p-4",
									glassmorphism.card,
									"border border-white/10 dark:border-white/5",
								)}
							>
								<h4 className="mb-4 font-semibold text-foreground">
									{card.cardName}
								</h4>

								<div className="grid gap-4 md:grid-cols-2">
									{/* Pros */}
									<div>
										<h5 className="mb-2 flex items-center gap-2 font-medium text-green-300 text-sm">
											<TrendingUp className="h-4 w-4" />
											Advantages
										</h5>
										<div className="space-y-2">
											{(comparisonData.pros[card.cardName] || []).map(
												(pro, index) => (
													<div key={index} className="flex items-start gap-2">
														<CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
														<span className="text-muted-foreground text-sm">
															{pro}
														</span>
													</div>
												),
											)}
										</div>
									</div>

									{/* Cons */}
									<div>
										<h5 className="mb-2 flex items-center gap-2 font-medium text-red-300 text-sm">
											<TrendingDown className="h-4 w-4" />
											Considerations
										</h5>
										<div className="space-y-2">
											{(comparisonData.cons[card.cardName] || []).map(
												(con, index) => (
													<div key={index} className="flex items-start gap-2">
														<XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
														<span className="text-muted-foreground text-sm">
															{con}
														</span>
													</div>
												),
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{selectedTab === "details" && (
					<div className="space-y-6">
						{/* Feature Comparison */}
						<div>
							<h3 className="mb-4 font-semibold text-foreground">
								Feature Comparison
							</h3>
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-white/10 border-b dark:border-white/5">
											<th className="p-2 text-left text-muted-foreground">
												Feature
											</th>
											{comparedCards.map((card) => (
												<th
													key={card.cardID}
													className="p-2 text-left text-foreground"
												>
													{card.cardName.split(" ").slice(0, 2).join(" ")}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{[
											{ label: "Card Type", key: "cardType" },
											{ label: "Joining Fee", key: "joiningFee" },
											{ label: "Annual Fee", key: "annualFee" },
											{ label: "Reward Rate", key: "rewardRate" },
											{
												label: "Min Income",
												key: "minMonthlyIncome",
												format: (value: number) => `₹${value.toLocaleString()}`,
											},
											{
												label: "Rating",
												key: "overAllRating",
												format: (value: number) => `${value}/5`,
											},
										].map(({ label, key, format }) => (
											<tr key={key} className="border-white/5 border-b">
												<td className="p-2 font-medium text-muted-foreground">
													{label}
												</td>
												{comparedCards.map((card) => (
													<td key={card.cardID} className="p-2 text-foreground">
														{format
															? format(card[key as keyof CreditCard] as any)
															: (card[key as keyof CreditCard] as string)
																	?.split("|")[0]
																	?.trim() || card[key as keyof CreditCard]}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Feature Lists */}
						<div>
							<h3 className="mb-4 font-semibold text-foreground">
								Available Features
							</h3>
							<div className="grid gap-4">
								{comparedCards.map((card) => {
									const cardFeatures = features.filter(
										(f) => f.cardID === card.cardID,
									);
									return (
										<div
											key={card.cardID}
											className={cn(
												"rounded-xl p-4",
												glassmorphism.card,
												"border border-white/10 dark:border-white/5",
											)}
										>
											<h4 className="mb-3 font-medium text-foreground">
												{card.cardName}
											</h4>
											<div className="flex flex-wrap gap-1.5">
												{cardFeatures.map((feature, index) => (
													<span
														key={index}
														className={cn(
															"rounded-md px-2 py-1 font-medium text-xs",
															"border border-blue-500/20 bg-blue-500/10 text-blue-300",
														)}
													>
														{feature.heading}
													</span>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<div
				className={cn(
					"border-white/10 border-t p-4 dark:border-white/5",
					"bg-gradient-to-r from-white/5 to-transparent",
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<Sparkles className="h-3 w-3 text-purple-400" />
						<span>Analysis powered by AI</span>
					</div>

					<button
						onClick={generateComparison}
						disabled={loading}
						className={cn(
							"rounded-lg px-3 py-1.5 font-medium text-xs",
							"transition-all duration-200",
							glassmorphism.button,
							"border border-white/10 dark:border-white/5",
							"hover:bg-white/10 dark:hover:bg-black/20",
							"disabled:cursor-not-allowed disabled:opacity-50",
							"flex items-center gap-2",
						)}
					>
						{loading ? (
							<>
								<Loader2 className="h-3 w-3 animate-spin" />
								Updating...
							</>
						) : (
							<>
								<ArrowRight className="h-3 w-3" />
								Refresh Analysis
							</>
						)}
					</button>
				</div>
			</div>

			{/* Decorative Elements */}
			<div className="absolute right-0 bottom-0 h-32 w-32 rounded-tl-full bg-gradient-to-tl from-purple-500/5 to-transparent" />
			<div className="absolute top-0 left-0 h-24 w-24 rounded-br-full bg-gradient-to-br from-blue-500/5 to-transparent" />
		</div>
	);
}

export default CardComparison;
