// app/api/suggestions/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { geminiService } from "~/lib/ai/gemini-service";
import { prisma } from "~/lib/database";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const limit = Number.parseInt(searchParams.get("limit") || "8");
		const type = searchParams.get("type") || "mixed"; // 'mixed', 'popular', 'ai_generated'

		let suggestions: string[] = [];

		switch (type) {
			case "popular":
				// Get popular search queries from the database
				const popularQueries = await prisma.searchQuery.groupBy({
					by: ["query"],
					_count: {
						query: true,
					},
					orderBy: {
						_count: {
							query: "desc",
						},
					},
					take: limit,
					where: {
						createdAt: {
							gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
						},
					},
				});

				suggestions = popularQueries.map((q) => q.query);
				break;

			case "ai_generated":
				// Use AI to generate suggestions based on available cards
				try {
					suggestions = await geminiService.generateSuggestedQueries();
				} catch (error) {
					console.error("Failed to generate AI suggestions:", error);
					suggestions = getStaticSuggestions();
				}
				break;

			case "mixed":
			default:
				// Mix of AI-generated and popular queries
				try {
					const [aiSuggestions, popularQueriesResult] = await Promise.all([
						geminiService.generateSuggestedQueries(),
						prisma.searchQuery.groupBy({
							by: ["query"],
							_count: {
								query: true,
							},
							orderBy: {
								_count: {
									query: "desc",
								},
							},
							take: Math.floor(limit / 2),
							where: {
								createdAt: {
									gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
								},
							},
						}),
					]);

					const popularSuggestions = popularQueriesResult.map((q) => q.query);

					// Combine and deduplicate
					const combined = [
						...aiSuggestions.slice(0, Math.ceil(limit / 2)),
						...popularSuggestions,
					];
					suggestions = [...new Set(combined)].slice(0, limit);
				} catch (error) {
					console.error("Failed to generate mixed suggestions:", error);
					suggestions = getStaticSuggestions();
				}
				break;
		}

		// Fallback to static suggestions if empty
		if (suggestions.length === 0) {
			suggestions = getStaticSuggestions().slice(0, limit);
		}

		return NextResponse.json({
			suggestions: suggestions.slice(0, limit),
			type,
			count: suggestions.length,
		});
	} catch (error) {
		console.error("Suggestions API error:", error);

		// Return static suggestions as fallback
		return NextResponse.json({
			suggestions: getStaticSuggestions().slice(0, 8),
			type: "fallback",
			count: 8,
		});
	} finally {
		await prisma.$disconnect();
	}
}

export async function POST(req: NextRequest) {
	try {
		const { query, userId, sessionId } = await req.json();

		if (!query || query.trim().length === 0) {
			return NextResponse.json({ error: "Query is required" }, { status: 400 });
		}

		// Log the search query for future suggestions
		await prisma.searchQuery.create({
			data: {
				query: query.trim(),
				queryType: "user_generated",
				userId: userId || null,
				sessionId: sessionId || null,
			},
		});

		// Get related suggestions based on the current query
		const relatedSuggestions = await getRelatedSuggestions(query.trim());

		return NextResponse.json({
			query: query.trim(),
			relatedSuggestions,
			count: relatedSuggestions.length,
		});
	} catch (error) {
		console.error("POST suggestions API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

// Helper function to get static fallback suggestions
function getStaticSuggestions(): string[] {
	return [
		"Best travel credit cards with lounge access",
		"Cards with no annual fee for beginners",
		"Premium cards for high income earners",
		"Best cashback cards for fuel and dining",
		"Credit cards with instant approval",
		"Student credit cards with low income requirements",
		"Business credit cards with rewards",
		"Cards with airport lounge access",
		"Zero percent interest credit cards",
		"Best credit cards for online shopping",
		"Lifetime free credit cards",
		"Cards with movie ticket discounts",
		"Credit cards for frequent travelers",
		"Cards with dining and entertainment benefits",
		"Low interest rate credit cards",
	];
}

// Helper function to get related suggestions based on a query
async function getRelatedSuggestions(query: string): Promise<string[]> {
	try {
		const keywords = query
			.toLowerCase()
			.split(/\s+/)
			.filter((word) => word.length > 2);

		if (keywords.length === 0) {
			return getStaticSuggestions().slice(0, 5);
		}

		// Find cards that match the query keywords
		const matchingCards = await prisma.creditCard.findMany({
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
				],
			},
			select: {
				bestFor: true,
				cardType: true,
				employmentType: true,
			},
			take: 10,
		});

		// Generate related suggestions based on matching cards
		const relatedCategories = new Set<string>();
		matchingCards.forEach((card) => {
			relatedCategories.add(card.bestFor);
			relatedCategories.add(card.cardType);
			relatedCategories.add(
				`${card.cardType} cards for ${card.employmentType.toLowerCase()}`,
			);
		});

		const related = Array.from(relatedCategories)
			.filter(
				(category) => !category.toLowerCase().includes(query.toLowerCase()),
			)
			.map((category) => `Best ${category.toLowerCase()} credit cards`)
			.slice(0, 5);

		return related.length > 0 ? related : getStaticSuggestions().slice(0, 5);
	} catch (error) {
		console.error("Error generating related suggestions:", error);
		return getStaticSuggestions().slice(0, 5);
	}
}
