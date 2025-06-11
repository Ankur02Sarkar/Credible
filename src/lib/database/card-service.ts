import { PrismaClient } from "@prisma/client";
import type { CardFeature, CreditCard } from "~/types/credit-card";

const prisma = new PrismaClient();

export interface CardSearchFilters {
	cardType?: string;
	employmentType?: string;
	minIncome?: number;
	maxIncome?: number;
	networkType?: string;
	bestFor?: string;
	isFeatured?: boolean;
	minRating?: number;
}

export interface CardSearchOptions {
	page?: number;
	limit?: number;
	sortBy?:
		| "featured"
		| "rating"
		| "income_low"
		| "income_high"
		| "newest"
		| "name";
	filters?: CardSearchFilters;
}

export interface CardSearchResult {
	cards: CreditCard[];
	features: CardFeature[];
	totalCount: number;
	totalPages: number;
	currentPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

class CardService {
	/**
	 * Get all credit cards with optional filtering and pagination
	 */
	async getCards(options: CardSearchOptions = {}): Promise<CardSearchResult> {
		const { page = 0, limit = 20, sortBy = "featured", filters = {} } = options;

		// Build where clause
		const whereClause: any = {
			publish: 1,
		};

		if (filters.cardType) {
			whereClause.cardType = {
				contains: filters.cardType,
				mode: "insensitive",
			};
		}

		if (filters.employmentType) {
			whereClause.employmentType = {
				contains: filters.employmentType,
				mode: "insensitive",
			};
		}

		if (filters.minIncome || filters.maxIncome) {
			whereClause.minMonthlyIncome = {};
			if (filters.minIncome) {
				whereClause.minMonthlyIncome.gte = filters.minIncome;
			}
			if (filters.maxIncome) {
				whereClause.minMonthlyIncome.lte = filters.maxIncome;
			}
		}

		if (filters.networkType) {
			whereClause.networkType = {
				contains: filters.networkType,
				mode: "insensitive",
			};
		}

		if (filters.bestFor) {
			whereClause.bestFor = {
				contains: filters.bestFor,
				mode: "insensitive",
			};
		}

		if (filters.isFeatured !== undefined) {
			whereClause.isFeatured = filters.isFeatured ? 1 : 0;
		}

		if (filters.minRating) {
			whereClause.overAllRating = {
				gte: filters.minRating,
			};
		}

		// Build order by clause
		let orderBy: any = {};
		switch (sortBy) {
			case "featured":
				orderBy = [
					{ isFeatured: "desc" },
					{ overAllRating: "desc" },
					{ statsCount: "desc" },
				];
				break;
			case "rating":
				orderBy = [{ overAllRating: "desc" }, { statsCount: "desc" }];
				break;
			case "newest":
				orderBy = { createdAt: "desc" };
				break;
			case "income_low":
				orderBy = { minMonthlyIncome: "asc" };
				break;
			case "income_high":
				orderBy = { minMonthlyIncome: "desc" };
				break;
			case "name":
				orderBy = { cardName: "asc" };
				break;
			default:
				orderBy = [{ isFeatured: "desc" }, { overAllRating: "desc" }];
		}

		const skip = page * limit;

		// Execute queries
		const [dbCards, totalCount] = await Promise.all([
			prisma.creditCard.findMany({
				where: whereClause,
				orderBy: orderBy,
				skip: skip,
				take: limit,
				include: {
					features: {
						orderBy: {
							serialNumber: "asc",
						},
					},
				},
			}),
			prisma.creditCard.count({
				where: whereClause,
			}),
		]);

		// Transform to expected types
		const cards: CreditCard[] = dbCards.map((card) => ({
			cardIssuerName: card.cardIssuerName,
			cardLogo: card.cardLogo,
			cardIssuerID: card.cardIssuerID,
			issuerImage: card.issuerImage,
			issuerSlug: card.issuerSlug,
			isFeatured: card.isFeatured,
			cardCount: card.cardCount,
			publish: card.publish,
			cardID: card.cardID,
			cardName: card.cardName,
			cardImage: card.cardImage,
			joiningFee: card.joiningFee,
			annualFee: card.annualFee,
			minMonthlyIncome: card.minMonthlyIncome,
			annualPercentageRate: card.annualPercentageRate,
			cardType: card.cardType,
			employmentType: card.employmentType,
			networkType: card.networkType,
			urlSlug: card.urlSlug,
			overAllRating: card.overAllRating,
			statsCount: card.statsCount,
			datecreated: card.datecreated.toISOString(),
			rewardPoints: card.rewardPoints,
			bestFor: card.bestFor,
			totalCards: card.totalCards,
			rewardRate: card.rewardRate,
			referralLink: card.referralLink,
		}));

		const features: CardFeature[] = dbCards.flatMap((card) =>
			card.features.map((feature) => ({
				cardFeatureID: feature.cardFeatureID,
				cardID: feature.cardID,
				serialNumber: feature.serialNumber,
				heading: feature.heading,
				description: feature.description,
			})),
		);

		const totalPages = Math.ceil(totalCount / limit);

		return {
			cards,
			features,
			totalCount,
			totalPages,
			currentPage: page,
			hasNextPage: page < totalPages - 1,
			hasPreviousPage: page > 0,
		};
	}

	/**
	 * Get a single credit card by ID
	 */
	async getCardById(
		cardId: string,
	): Promise<{ card: CreditCard; features: CardFeature[] } | null> {
		const dbCard = await prisma.creditCard.findUnique({
			where: {
				cardID: cardId,
				publish: 1,
			},
			include: {
				features: {
					orderBy: {
						serialNumber: "asc",
					},
				},
			},
		});

		if (!dbCard) {
			return null;
		}

		const card: CreditCard = {
			cardIssuerName: dbCard.cardIssuerName,
			cardLogo: dbCard.cardLogo,
			cardIssuerID: dbCard.cardIssuerID,
			issuerImage: dbCard.issuerImage,
			issuerSlug: dbCard.issuerSlug,
			isFeatured: dbCard.isFeatured,
			cardCount: dbCard.cardCount,
			publish: dbCard.publish,
			cardID: dbCard.cardID,
			cardName: dbCard.cardName,
			cardImage: dbCard.cardImage,
			joiningFee: dbCard.joiningFee,
			annualFee: dbCard.annualFee,
			minMonthlyIncome: dbCard.minMonthlyIncome,
			annualPercentageRate: dbCard.annualPercentageRate,
			cardType: dbCard.cardType,
			employmentType: dbCard.employmentType,
			networkType: dbCard.networkType,
			urlSlug: dbCard.urlSlug,
			overAllRating: dbCard.overAllRating,
			statsCount: dbCard.statsCount,
			datecreated: dbCard.datecreated.toISOString(),
			rewardPoints: dbCard.rewardPoints,
			bestFor: dbCard.bestFor,
			totalCards: dbCard.totalCards,
			rewardRate: dbCard.rewardRate,
			referralLink: dbCard.referralLink,
		};

		const features: CardFeature[] = dbCard.features.map((feature) => ({
			cardFeatureID: feature.cardFeatureID,
			cardID: feature.cardID,
			serialNumber: feature.serialNumber,
			heading: feature.heading,
			description: feature.description,
		}));

		return { card, features };
	}

	/**
	 * Get cards by multiple IDs
	 */
	async getCardsByIds(
		cardIds: string[],
	): Promise<{ cards: CreditCard[]; features: CardFeature[] }> {
		const dbCards = await prisma.creditCard.findMany({
			where: {
				cardID: { in: cardIds },
				publish: 1,
			},
			include: {
				features: {
					orderBy: {
						serialNumber: "asc",
					},
				},
			},
			orderBy: [{ isFeatured: "desc" }, { overAllRating: "desc" }],
		});

		const cards: CreditCard[] = dbCards.map((card) => ({
			cardIssuerName: card.cardIssuerName,
			cardLogo: card.cardLogo,
			cardIssuerID: card.cardIssuerID,
			issuerImage: card.issuerImage,
			issuerSlug: card.issuerSlug,
			isFeatured: card.isFeatured,
			cardCount: card.cardCount,
			publish: card.publish,
			cardID: card.cardID,
			cardName: card.cardName,
			cardImage: card.cardImage,
			joiningFee: card.joiningFee,
			annualFee: card.annualFee,
			minMonthlyIncome: card.minMonthlyIncome,
			annualPercentageRate: card.annualPercentageRate,
			cardType: card.cardType,
			employmentType: card.employmentType,
			networkType: card.networkType,
			urlSlug: card.urlSlug,
			overAllRating: card.overAllRating,
			statsCount: card.statsCount,
			datecreated: card.datecreated.toISOString(),
			rewardPoints: card.rewardPoints,
			bestFor: card.bestFor,
			totalCards: card.totalCards,
			rewardRate: card.rewardRate,
			referralLink: card.referralLink,
		}));

		const features: CardFeature[] = dbCards.flatMap((card) =>
			card.features.map((feature) => ({
				cardFeatureID: feature.cardFeatureID,
				cardID: feature.cardID,
				serialNumber: feature.serialNumber,
				heading: feature.heading,
				description: feature.description,
			})),
		);

		return { cards, features };
	}

	/**
	 * Get featured cards
	 */
	async getFeaturedCards(
		limit = 10,
	): Promise<{ cards: CreditCard[]; features: CardFeature[] }> {
		const dbCards = await prisma.creditCard.findMany({
			where: {
				publish: 1,
				isFeatured: 1,
			},
			include: {
				features: {
					orderBy: {
						serialNumber: "asc",
					},
				},
			},
			orderBy: [{ overAllRating: "desc" }, { statsCount: "desc" }],
			take: limit,
		});

		const cards: CreditCard[] = dbCards.map((card) => ({
			cardIssuerName: card.cardIssuerName,
			cardLogo: card.cardLogo,
			cardIssuerID: card.cardIssuerID,
			issuerImage: card.issuerImage,
			issuerSlug: card.issuerSlug,
			isFeatured: card.isFeatured,
			cardCount: card.cardCount,
			publish: card.publish,
			cardID: card.cardID,
			cardName: card.cardName,
			cardImage: card.cardImage,
			joiningFee: card.joiningFee,
			annualFee: card.annualFee,
			minMonthlyIncome: card.minMonthlyIncome,
			annualPercentageRate: card.annualPercentageRate,
			cardType: card.cardType,
			employmentType: card.employmentType,
			networkType: card.networkType,
			urlSlug: card.urlSlug,
			overAllRating: card.overAllRating,
			statsCount: card.statsCount,
			datecreated: card.datecreated.toISOString(),
			rewardPoints: card.rewardPoints,
			bestFor: card.bestFor,
			totalCards: card.totalCards,
			rewardRate: card.rewardRate,
			referralLink: card.referralLink,
		}));

		const features: CardFeature[] = dbCards.flatMap((card) =>
			card.features.map((feature) => ({
				cardFeatureID: feature.cardFeatureID,
				cardID: feature.cardID,
				serialNumber: feature.serialNumber,
				heading: feature.heading,
				description: feature.description,
			})),
		);

		return { cards, features };
	}

	/**
	 * Search cards by text query
	 */
	async searchCards(
		query: string,
		limit = 20,
	): Promise<{ cards: CreditCard[]; features: CardFeature[] }> {
		const dbCards = await prisma.creditCard.findMany({
			where: {
				publish: 1,
				OR: [
					{
						cardName: {
							contains: query,
							mode: "insensitive",
						},
					},
					{
						bestFor: {
							contains: query,
							mode: "insensitive",
						},
					},
					{
						cardType: {
							contains: query,
							mode: "insensitive",
						},
					},
					{
						cardIssuerName: {
							contains: query,
							mode: "insensitive",
						},
					},
					{
						features: {
							some: {
								OR: [
									{
										heading: {
											contains: query,
											mode: "insensitive",
										},
									},
									{
										description: {
											contains: query,
											mode: "insensitive",
										},
									},
								],
							},
						},
					},
				],
			},
			include: {
				features: {
					orderBy: {
						serialNumber: "asc",
					},
				},
			},
			orderBy: [{ isFeatured: "desc" }, { overAllRating: "desc" }],
			take: limit,
		});

		const cards: CreditCard[] = dbCards.map((card) => ({
			cardIssuerName: card.cardIssuerName,
			cardLogo: card.cardLogo,
			cardIssuerID: card.cardIssuerID,
			issuerImage: card.issuerImage,
			issuerSlug: card.issuerSlug,
			isFeatured: card.isFeatured,
			cardCount: card.cardCount,
			publish: card.publish,
			cardID: card.cardID,
			cardName: card.cardName,
			cardImage: card.cardImage,
			joiningFee: card.joiningFee,
			annualFee: card.annualFee,
			minMonthlyIncome: card.minMonthlyIncome,
			annualPercentageRate: card.annualPercentageRate,
			cardType: card.cardType,
			employmentType: card.employmentType,
			networkType: card.networkType,
			urlSlug: card.urlSlug,
			overAllRating: card.overAllRating,
			statsCount: card.statsCount,
			datecreated: card.datecreated.toISOString(),
			rewardPoints: card.rewardPoints,
			bestFor: card.bestFor,
			totalCards: card.totalCards,
			rewardRate: card.rewardRate,
			referralLink: card.referralLink,
		}));

		const features: CardFeature[] = dbCards.flatMap((card) =>
			card.features.map((feature) => ({
				cardFeatureID: feature.cardFeatureID,
				cardID: feature.cardID,
				serialNumber: feature.serialNumber,
				heading: feature.heading,
				description: feature.description,
			})),
		);

		return { cards, features };
	}

	/**
	 * Get filter options for the frontend
	 */
	async getFilterOptions() {
		const [cardTypes, employmentTypes, networkTypes, bestForCategories] =
			await Promise.all([
				prisma.creditCard.findMany({
					select: { cardType: true },
					distinct: ["cardType"],
					where: { publish: 1 },
				}),
				prisma.creditCard.findMany({
					select: { employmentType: true },
					distinct: ["employmentType"],
					where: { publish: 1 },
				}),
				prisma.creditCard.findMany({
					select: { networkType: true },
					distinct: ["networkType"],
					where: { publish: 1, networkType: { not: null } },
				}),
				prisma.creditCard.findMany({
					select: { bestFor: true },
					distinct: ["bestFor"],
					where: { publish: 1 },
				}),
			]);

		const incomeRanges = [
			{ label: "Up to ₹25,000", value: "0-25000" },
			{ label: "₹25,000 - ₹50,000", value: "25000-50000" },
			{ label: "₹50,000 - ₹1,00,000", value: "50000-100000" },
			{ label: "₹1,00,000 - ₹2,00,000", value: "100000-200000" },
			{ label: "Above ₹2,00,000", value: "200000-999999999" },
		];

		return {
			cardTypes: cardTypes.map((ct) => ({
				label: ct.cardType,
				value: ct.cardType,
			})),
			employmentTypes: employmentTypes.map((et) => ({
				label: et.employmentType,
				value: et.employmentType,
			})),
			networkTypes: networkTypes.map((nt) => ({
				label: nt.networkType!,
				value: nt.networkType!,
			})),
			bestForCategories: bestForCategories.map((bf) => ({
				label: bf.bestFor,
				value: bf.bestFor,
			})),
			incomeRanges,
		};
	}

	/**
	 * Get card statistics
	 */
	async getCardStats() {
		const [totalCards, featuredCards, avgRating, topRatedCards] =
			await Promise.all([
				prisma.creditCard.count({ where: { publish: 1 } }),
				prisma.creditCard.count({ where: { publish: 1, isFeatured: 1 } }),
				prisma.creditCard.aggregate({
					where: { publish: 1 },
					_avg: { overAllRating: true },
				}),
				prisma.creditCard.findMany({
					where: { publish: 1 },
					orderBy: { overAllRating: "desc" },
					take: 5,
					select: {
						cardID: true,
						cardName: true,
						overAllRating: true,
						statsCount: true,
					},
				}),
			]);

		return {
			totalCards,
			featuredCards,
			averageRating: avgRating._avg.overAllRating || 0,
			topRatedCards,
		};
	}

	/**
	 * Clean up resources
	 */
	async disconnect() {
		await prisma.$disconnect();
	}
}

export const cardService = new CardService();
export default cardService;
