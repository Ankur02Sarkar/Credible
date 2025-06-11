"use client";

import {
	Award,
	Brain,
	MessageSquare,
	Scale,
	Search,
	Sparkles,
	Star,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ChatInterface } from "~/components/ai-chat/ChatInterface";
import { SearchInterface } from "~/components/ai-chat/SearchInterface";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";

import { CardComparison } from "~/components/ai-chat/CardComparison";
import { geminiService } from "~/lib/ai/gemini-service";
import type { CardFeature, CreditCard } from "~/types/credit-card";

// Sample credit card data for demo
const sampleCards: CreditCard[] = [
	{
		cardIssuerName: "HDFC Bank",
		cardLogo: null,
		cardIssuerID: "hdfc-001",
		issuerImage: "Select/Issuers/hdfc.jpg",
		issuerSlug: "hdfc-bank-regalia-credit-card",
		isFeatured: 1,
		cardCount: null,
		publish: 1,
		cardID: "1d8c302f-544c-492a-9713-501b893b328c",
		cardName: "HDFC Bank Regalia",
		cardImage: "Select/CreditCards/hdfc-regalia.png",
		joiningFee: "₹ 2500 | plus Applicable Taxes",
		annualFee: "₹ 2500 | plus Applicable Taxes",
		minMonthlyIncome: 100000,
		annualPercentageRate: "3.60% per month | 43.2%",
		cardType: "Premium Cards",
		employmentType: "Salaried | Self Employed",
		networkType: "Visa",
		urlSlug: "hdfc-bank-regalia-credit-card",
		overAllRating: 4.6,
		statsCount: 30945,
		datecreated: "2023-04-03T15:05:30.413",
		rewardPoints: "4 Points per ₹150 spent",
		bestFor: "Lifestyle",
		totalCards: null,
		rewardRate: "1.3% to 13%",
		referralLink: null,
	},
	{
		cardIssuerName: "American Express",
		cardLogo: null,
		cardIssuerID: "amex-001",
		issuerImage: "Select/Issuers/amex.jpg",
		issuerSlug: "american-express-platinum-travel-credit-card",
		isFeatured: 1,
		cardCount: null,
		publish: 1,
		cardID: "06c09e9e-81e7-4795-804f-dd974407ddb1",
		cardName: "American Express Platinum Travel",
		cardImage: "Select/CreditCards/amex-platinum.png",
		joiningFee: "₹ 3,500 | plus applicable taxes",
		annualFee: "₹ 5,000 | plus applicable taxes",
		minMonthlyIncome: 50000,
		annualPercentageRate: "3.50% per month | 42%",
		cardType: "Travel Cards",
		employmentType: "Salaried | Self Employed",
		networkType: "American Express",
		urlSlug: "american-express-platinum-travel-credit-card",
		overAllRating: 4.5,
		statsCount: 18206,
		datecreated: "2023-04-06T17:47:57.547",
		rewardPoints: "1000 Points on ₹4000 spent",
		bestFor: "Travel",
		totalCards: null,
		rewardRate: "3% to 7.5%",
		referralLink: null,
	},
	{
		cardIssuerName: "Axis Bank",
		cardLogo: null,
		cardIssuerID: "axis-001",
		issuerImage: "Select/Issuers/axis.jpg",
		issuerSlug: "axis-bank-magnus-credit-card",
		isFeatured: 1,
		cardCount: null,
		publish: 1,
		cardID: "axis-magnus-001",
		cardName: "Axis Bank Magnus",
		cardImage: "Select/CreditCards/axis-magnus.png",
		joiningFee: "₹ 12,500 | plus applicable taxes",
		annualFee: "₹ 12,500 | plus applicable taxes",
		minMonthlyIncome: 150000,
		annualPercentageRate: "3.60% per month | 52.86%",
		cardType: "Super Premium Cards",
		employmentType: "Salaried | Self Employed",
		networkType: "Mastercard",
		urlSlug: "axis-bank-magnus-credit-card",
		overAllRating: 4.8,
		statsCount: 25000,
		datecreated: "2023-04-01T10:00:00.000",
		rewardPoints: "25 EDGE Miles per ₹200 spent",
		bestFor: "Travel",
		totalCards: null,
		rewardRate: "4.8% to 24%",
		referralLink: null,
	},
];

const sampleFeatures: CardFeature[] = [
	{
		cardFeatureID: "f1",
		cardID: "1d8c302f-544c-492a-9713-501b893b328c",
		serialNumber: 1,
		heading: "Lounge Access",
		description: null,
	},
	{
		cardFeatureID: "f2",
		cardID: "1d8c302f-544c-492a-9713-501b893b328c",
		serialNumber: 2,
		heading: "Insurance Benefit",
		description: null,
	},
	{
		cardFeatureID: "f3",
		cardID: "1d8c302f-544c-492a-9713-501b893b328c",
		serialNumber: 3,
		heading: "Reward Points",
		description: null,
	},
	{
		cardFeatureID: "f4",
		cardID: "06c09e9e-81e7-4795-804f-dd974407ddb1",
		serialNumber: 1,
		heading: "Travel Benefit",
		description: null,
	},
	{
		cardFeatureID: "f5",
		cardID: "06c09e9e-81e7-4795-804f-dd974407ddb1",
		serialNumber: 2,
		heading: "Lounge Access",
		description: null,
	},
	{
		cardFeatureID: "f6",
		cardID: "06c09e9e-81e7-4795-804f-dd974407ddb1",
		serialNumber: 3,
		heading: "Zero Lost Card Liability",
		description: null,
	},
	{
		cardFeatureID: "f7",
		cardID: "axis-magnus-001",
		serialNumber: 1,
		heading: "Travel Benefit",
		description: null,
	},
	{
		cardFeatureID: "f8",
		cardID: "axis-magnus-001",
		serialNumber: 2,
		heading: "Lounge Access",
		description: null,
	},
	{
		cardFeatureID: "f9",
		cardID: "axis-magnus-001",
		serialNumber: 3,
		heading: "Concierge Services",
		description: null,
	},
	{
		cardFeatureID: "f10",
		cardID: "axis-magnus-001",
		serialNumber: 4,
		heading: "Golf Benefits",
		description: null,
	},
];

export default function DemoPage() {
	const [activeDemo, setActiveDemo] = useState<
		"search" | "chat" | "summary" | "comparison"
	>("search");
	const [filteredCards, setFilteredCards] = useState<CreditCard[]>(sampleCards);
	const [loading, setLoading] = useState(false);
	const [comparisonCards, setComparisonCards] = useState<CreditCard[]>([
		sampleCards[0]!,
		sampleCards[1]!,
	]);

	const demoQueries = [
		"Show me premium travel cards with lounge access",
		"Best cards for high income earners above ₹1 lakh",
		"Compare HDFC Regalia vs Amex Platinum for travel benefits",
		"Cards with no annual fee for first-time users",
		"Luxury cards with concierge services",
	];

	const handleDemoSearch = async (query: string) => {
		setLoading(true);
		try {
			// Simulate AI processing
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Simple keyword-based filtering for demo
			const keywords = query.toLowerCase().split(" ");
			const filtered = sampleCards.filter((card) => {
				const cardText =
					`${card.cardName} ${card.bestFor} ${card.cardType}`.toLowerCase();
				const cardFeatures = sampleFeatures
					.filter((f) => f.cardID === card.cardID)
					.map((f) => f.heading.toLowerCase())
					.join(" ");

				return keywords.some(
					(keyword) =>
						cardText.includes(keyword) || cardFeatures.includes(keyword),
				);
			});

			setFilteredCards(filtered.length > 0 ? filtered : sampleCards);
		} catch (error) {
			console.error("Demo search error:", error);
		} finally {
			setLoading(false);
		}
	};

	const FeatureCard = ({
		icon: Icon,
		title,
		description,
		isActive,
		onClick,
	}: {
		icon: any;
		title: string;
		description: string;
		isActive: boolean;
		onClick: () => void;
	}) => (
		<button
			onClick={onClick}
			className={cn(
				"rounded-xl p-6 text-left transition-all duration-300",
				"border hover:scale-105",
				isActive
					? "border-blue-500/50 bg-blue-500/10"
					: "border-white/10 hover:border-blue-500/30 dark:border-white/5",
				glassmorphism.card,
				"group",
			)}
		>
			<div className="mb-3 flex items-center gap-3">
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-lg",
						isActive ? "bg-blue-500/20" : "bg-white/10 dark:bg-black/20",
						"transition-colors duration-300",
					)}
				>
					<Icon
						className={cn(
							"h-5 w-5",
							isActive
								? "text-blue-400"
								: "text-muted-foreground group-hover:text-blue-400",
						)}
					/>
				</div>
				<h3 className="font-semibold text-foreground">{title}</h3>
			</div>
			<p className="text-muted-foreground text-sm leading-relaxed">
				{description}
			</p>
		</button>
	);

	const StatsCard = ({
		icon: Icon,
		label,
		value,
		color,
	}: {
		icon: any;
		label: string;
		value: string;
		color: string;
	}) => (
		<div
			className={cn(
				"rounded-xl p-4",
				glassmorphism.card,
				"border border-white/10 dark:border-white/5",
			)}
		>
			<div className="flex items-center gap-3">
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-lg",
						color,
					)}
				>
					<Icon className="h-5 w-5 text-white" />
				</div>
				<div>
					<div className="font-bold text-foreground text-xl">{value}</div>
					<div className="text-muted-foreground text-sm">{label}</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 dark:from-black dark:via-slate-900 dark:to-purple-950">
			{/* Background Elements */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
				<div className="absolute top-3/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000" />
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform animate-pulse rounded-full bg-pink-500/5 blur-3xl delay-2000" />
			</div>

			<div className="relative z-10">
				{/* Header */}
				<div
					className={cn(
						"border-white/10 border-b p-6 dark:border-white/5",
						glassmorphism.nav,
						"backdrop-blur-xl",
					)}
				>
					<div className="mx-auto max-w-7xl">
						<div className="space-y-4 text-center">
							<div className="flex items-center justify-center gap-3">
								<div
									className={cn(
										"flex h-12 w-12 items-center justify-center rounded-full",
										"bg-gradient-to-r from-purple-500/20 to-blue-500/20",
										"border border-purple-500/30",
									)}
								>
									<Brain className="h-6 w-6 text-purple-300" />
								</div>
								<h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold text-3xl text-transparent">
									AI Credit Card Advisor
								</h1>
							</div>
							<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
								Experience the future of credit card discovery with our
								AI-powered platform. Ask natural language questions, get
								personalized recommendations, and compare cards intelligently.
							</p>
						</div>
					</div>
				</div>

				<div className="mx-auto max-w-7xl space-y-8 p-6">
					{/* Feature Selection */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<FeatureCard
							icon={Search}
							title="AI Search"
							description="Ask natural language questions about credit cards and get intelligent results."
							isActive={activeDemo === "search"}
							onClick={() => setActiveDemo("search")}
						/>
						<FeatureCard
							icon={MessageSquare}
							title="Chat Assistant"
							description="Have conversations with our AI to find the perfect credit card for your needs."
							isActive={activeDemo === "chat"}
							onClick={() => setActiveDemo("chat")}
						/>
						<FeatureCard
							icon={Sparkles}
							title="AI Summaries"
							description="Get AI-generated summaries highlighting key benefits and ideal user profiles."
							isActive={activeDemo === "summary"}
							onClick={() => setActiveDemo("summary")}
						/>
						<FeatureCard
							icon={Scale}
							title="Smart Comparison"
							description="Compare cards side-by-side with AI-powered insights and recommendations."
							isActive={activeDemo === "comparison"}
							onClick={() => setActiveDemo("comparison")}
						/>
					</div>

					{/* Demo Content */}
					<div className="space-y-8">
						{activeDemo === "search" && (
							<div className="space-y-6">
								<div
									className={cn(
										"rounded-xl p-6",
										glassmorphism.container,
										glassGradients.card,
										"border border-white/10 dark:border-white/5",
									)}
								>
									<h2 className="mb-4 font-semibold text-foreground text-xl">
										AI-Powered Search
									</h2>
									<SearchInterface
										onSearch={handleDemoSearch}
										suggestedQueries={demoQueries}
										recentQueries={[]}
										loading={loading}
									/>
								</div>

								{/* Search Results */}
								<div className="grid gap-6">
									<h3 className="font-semibold text-foreground text-lg">
										{filteredCards.length} Cards Found
									</h3>
									<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
										{filteredCards.map((card) => (
											<div
												key={card.cardID}
												className={cn(
													"rounded-xl p-6",
													glassmorphism.card,
													"border border-white/10 dark:border-white/5",
													"transition-all duration-300 hover:scale-105",
												)}
											>
												<h4 className="mb-2 font-semibold text-foreground">
													{card.cardName}
												</h4>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Best For:
														</span>
														<span className="font-medium text-foreground">
															{card.bestFor}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Reward Rate:
														</span>
														<span className="font-medium text-foreground">
															{card.rewardRate}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Annual Fee:
														</span>
														<span className="font-medium text-foreground">
															{card.annualFee.split("|")[0]?.trim()}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{activeDemo === "chat" && (
							<div
								className={cn(
									"rounded-xl p-6",
									glassmorphism.container,
									glassGradients.card,
									"border border-white/10 dark:border-white/5",
								)}
							>
								<h2 className="mb-4 font-semibold text-foreground text-xl">
									AI Chat Assistant
								</h2>
								<div className="relative h-96">
									<ChatInterface
										onQuery={handleDemoSearch}
										suggestedQueries={demoQueries}
										loading={loading}
										className="h-full"
									/>
								</div>
							</div>
						)}

						{activeDemo === "summary" && (
							<div className="space-y-6">
								<h2 className="font-semibold text-foreground text-xl">
									AI-Generated Card Summaries
								</h2>
								<p className="mb-6 text-muted-foreground">
									Click the "AI Summary" button on any credit card to see
									AI-generated insights and recommendations.
								</p>
								<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
									{sampleCards.slice(0, 2).map((card) => (
										<div
											key={card.cardID}
											className={cn(
												"rounded-xl p-6",
												glassmorphism.card,
												"border border-white/10 dark:border-white/5",
												"transition-all duration-300 hover:scale-105",
											)}
										>
											<h4 className="mb-2 font-semibold text-foreground">
												{card.cardName}
											</h4>
											<div className="mb-4 space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Best For:
													</span>
													<span className="font-medium text-foreground">
														{card.bestFor}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Reward Rate:
													</span>
													<span className="font-medium text-foreground">
														{card.rewardRate}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Annual Fee:
													</span>
													<span className="font-medium text-foreground">
														{card.annualFee.split("|")[0]?.trim()}
													</span>
												</div>
											</div>
											<div
												className={cn(
													"rounded-lg p-3 text-center",
													"bg-gradient-to-r from-purple-500/10 to-blue-500/10",
													"border border-purple-500/20",
												)}
											>
												<div className="flex items-center justify-center gap-2 text-purple-300 text-sm">
													<Sparkles className="h-4 w-4" />
													<span>Click AI Summary button to see insights</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{activeDemo === "comparison" && (
							<div className="space-y-6">
								<h2 className="font-semibold text-foreground text-xl">
									Smart Card Comparison
								</h2>
								<CardComparison
									cards={comparisonCards}
									features={sampleFeatures}
								/>
							</div>
						)}
					</div>

					{/* Stats Section */}
					<div
						className={cn(
							"rounded-xl p-6",
							glassmorphism.container,
							glassGradients.card,
							"border border-white/10 dark:border-white/5",
						)}
					>
						<h2 className="mb-6 text-center font-semibold text-foreground text-xl">
							Platform Statistics
						</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
							<StatsCard
								icon={TrendingUp}
								label="AI Queries Processed"
								value="10,000+"
								color="bg-blue-500"
							/>
							<StatsCard
								icon={Award}
								label="Credit Cards Analyzed"
								value="500+"
								color="bg-green-500"
							/>
							<StatsCard
								icon={Star}
								label="User Satisfaction"
								value="4.9/5"
								color="bg-yellow-500"
							/>
							<StatsCard
								icon={Brain}
								label="AI Accuracy"
								value="95%"
								color="bg-purple-500"
							/>
						</div>
					</div>

					{/* Features Highlight */}
					<div
						className={cn(
							"rounded-xl p-6 text-center",
							"bg-gradient-to-r from-purple-500/10 to-blue-500/10",
							"border border-purple-500/20",
						)}
					>
						<h2 className="mb-4 font-bold text-2xl text-foreground">
							Why Choose Our AI Credit Card Advisor?
						</h2>
						<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
							<div className="space-y-2">
								<Brain className="mx-auto h-8 w-8 text-purple-400" />
								<h3 className="font-semibold text-foreground">
									Smart Recommendations
								</h3>
								<p className="text-muted-foreground text-sm">
									Our AI analyzes your spending patterns and preferences to
									suggest the best cards.
								</p>
							</div>
							<div className="space-y-2">
								<MessageSquare className="mx-auto h-8 w-8 text-blue-400" />
								<h3 className="font-semibold text-foreground">
									Natural Language Search
								</h3>
								<p className="text-muted-foreground text-sm">
									Ask questions in plain English and get intelligent, contextual
									responses.
								</p>
							</div>
							<div className="space-y-2">
								<Scale className="mx-auto h-8 w-8 text-green-400" />
								<h3 className="font-semibold text-foreground">
									Intelligent Comparisons
								</h3>
								<p className="text-muted-foreground text-sm">
									Compare cards with AI-powered insights highlighting pros,
									cons, and best use cases.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Floating Elements */}
			<div className="fixed right-6 bottom-6 z-50">
				<div
					className={cn("h-3 w-3 animate-pulse rounded-full bg-green-500")}
				/>
			</div>
		</div>
	);
}
