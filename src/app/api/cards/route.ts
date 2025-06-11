import { PrismaClient } from "@prisma/client";
// app/api/cards/route.ts
import { type NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
	try {
		const {
			sortby = "featured",
			privileges = "",
			emptype = "",
			incomeRange = "",
			page = 0,
			limit = 20,
		} = await req.json();

		// Build the where clause based on filters
		const whereClause: any = {
			publish: 1, // Only published cards
		};

		// Filter by employment type
		if (emptype && emptype !== "") {
			whereClause.employmentType = {
				contains: emptype,
				mode: "insensitive",
			};
		}

		// Filter by income range
		if (incomeRange && incomeRange !== "") {
			const [minIncome, maxIncome] = incomeRange.split("-").map(Number);
			if (minIncome) {
				whereClause.minMonthlyIncome = {
					gte: minIncome,
				};
				if (maxIncome) {
					whereClause.minMonthlyIncome.lte = maxIncome;
				}
			}
		}

		// Filter by privileges/card type
		if (privileges && privileges !== "") {
			whereClause.cardType = {
				contains: privileges,
				mode: "insensitive",
			};
		}

		// Build the orderBy clause based on sortby
		let orderBy: any = {};
		switch (sortby) {
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

		// Calculate pagination
		const skip = page * limit;

		// Execute the query
		const [cards, totalCount] = await Promise.all([
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

		// Transform the data to match the expected API response format
		const transformedCards = cards.map((card) => ({
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

		// Transform features
		const cardFeatureList = cards.flatMap((card) =>
			card.features.map((feature) => ({
				cardFeatureID: feature.cardFeatureID,
				cardID: feature.cardID,
				serialNumber: feature.serialNumber,
				heading: feature.heading,
				description: feature.description,
			})),
		);

		// Get unique values for filters (for frontend filter options)
		const [cardTypes, employmentTypes, networkTypes] = await Promise.all([
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
		]);

		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / limit);
		const hasNextPage = page < totalPages - 1;
		const hasPreviousPage = page > 0;

		// Construct the response in the expected format
		const response = {
			thisCard: null,
			issuerList: null,
			cardType: cardTypes.map((ct) => ct.cardType),
			cardFeature: null,
			networkType: networkTypes.map((nt) => nt.networkType),
			joiningFee: null,
			employmentType: employmentTypes.map((et) => et.employmentType),
			faqdetails: null,
			seoDetail: null,
			pageCount: totalPages,
			page: page,
			cardCount: cards.length,
			totalCardCount: totalCount,
			cardIssuer: transformedCards,
			cardFeatureList: cardFeatureList,
			statistics: null,
			thisIssuer: null,
			cardIssuerId: null,
			referralLink: null,
			finedineuser: null,
			premiumuser: null,
			mode: null,
			leads: null,
			cardLeads: null,
			seoSchemas: null,
			pagination: {
				currentPage: page,
				totalPages: totalPages,
				totalItems: totalCount,
				itemsPerPage: limit,
				hasNextPage: hasNextPage,
				hasPreviousPage: hasPreviousPage,
			},
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Database error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const sortby = searchParams.get("sortby") || "featured";
		const privileges = searchParams.get("privileges") || "";
		const emptype = searchParams.get("emptype") || "";
		const incomeRange = searchParams.get("incomeRange") || "";
		const page = Number.parseInt(searchParams.get("page") || "0");
		const limit = Number.parseInt(searchParams.get("limit") || "20");

		// Create a request object to reuse the POST logic
		const mockRequest = {
			json: async () => ({
				sortby,
				privileges,
				emptype,
				incomeRange,
				page,
				limit,
			}),
		} as NextRequest;

		// Reuse the POST logic
		return await POST(mockRequest);
	} catch (error) {
		console.error("GET request error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
