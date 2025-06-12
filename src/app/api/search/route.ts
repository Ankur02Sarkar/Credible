import { GoogleGenerativeAI } from "@google/generative-ai";
// app/api/search/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/database";
const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
);

// Utility function to generate embeddings for search queries
async function generateQueryEmbedding(query: string): Promise<number[]> {
	try {
		const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
		const result = await model.embedContent(query);
		const embedding = result.embedding;
		return embedding.values || [];
	} catch (error) {
		console.error("Error generating query embedding:", error);
		return [];
	}
}

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length) return 0;

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
		normA += (a[i] ?? 0) * (a[i] ?? 0);
		normB += (b[i] ?? 0) * (b[i] ?? 0);
	}

	if (normA === 0 || normB === 0) return 0;

	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Fallback keyword search function
async function keywordSearch(query: string, limit = 10) {
	const keywords = query.toLowerCase().split(/\s+/);

	const cards = await prisma.creditCard.findMany({
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
		take: limit,
		orderBy: [{ isFeatured: "desc" }, { overAllRating: "desc" }],
	});

	return cards.map((card) => ({
		card,
		similarity: 0.5, // Default similarity for keyword matches
		matchReason: "keyword_match",
	}));
}

export async function POST(req: NextRequest) {
	try {
		const { query, limit = 10, threshold = 0.7 } = await req.json();

		if (!query || query.trim().length === 0) {
			return NextResponse.json(
				{ error: "Search query is required" },
				{ status: 400 },
			);
		}

		console.log(`Searching for: "${query}"`);

		// Log the search query for analytics
		await prisma.searchQuery.create({
			data: {
				query: query.trim(),
				queryType: "semantic_search",
				filters: { threshold, limit },
			},
		});

		// Generate embedding for the search query
		const queryEmbedding = await generateQueryEmbedding(query);

		if (queryEmbedding.length === 0) {
			console.log(
				"Falling back to keyword search due to embedding generation failure",
			);
			const keywordResults = await keywordSearch(query, limit);

			return NextResponse.json({
				query,
				results: keywordResults.map((result) => ({
					...result.card,
					similarity: result.similarity,
					matchReason: result.matchReason,
				})),
				searchType: "keyword",
				totalResults: keywordResults.length,
			});
		}

		// Get all card embeddings from the database
		const cardEmbeddings = await prisma.cardEmbedding.findMany({
			where: {
				contentType: "card_summary",
			},
			include: {
				card: {
					include: {
						features: {
							orderBy: {
								serialNumber: "asc",
							},
						},
					},
				},
			},
		});

		// Calculate similarities
		const similarities = cardEmbeddings
			.filter((embedding) => embedding.card && embedding.card.publish === 1) // Only include cards that exist and are published
			.map((embedding) => {
				const similarity = cosineSimilarity(
					queryEmbedding,
					embedding.embedding,
				);
				return {
					card: embedding.card!,
					similarity,
					matchReason: "semantic_match",
				};
			})
			.filter((result) => result.similarity >= threshold) // Filter by similarity threshold
			.sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
			.slice(0, limit); // Limit results

		// If no semantic matches found, fall back to keyword search
		if (similarities.length === 0) {
			console.log("No semantic matches found, falling back to keyword search");
			const keywordResults = await keywordSearch(query, limit);

			return NextResponse.json({
				query,
				results: keywordResults.map((result) => ({
					...result.card,
					features: result.card.features,
					similarity: result.similarity,
					matchReason: result.matchReason,
				})),
				searchType: "keyword_fallback",
				totalResults: keywordResults.length,
				note: "No semantic matches found above threshold, showing keyword results",
			});
		}

		// Transform results to match expected format
		const transformedResults = similarities.map((result) => ({
			cardIssuerName: result.card.cardIssuerName,
			cardLogo: result.card.cardLogo,
			cardIssuerID: result.card.cardIssuerID,
			issuerImage: result.card.issuerImage,
			issuerSlug: result.card.issuerSlug,
			isFeatured: result.card.isFeatured,
			cardCount: result.card.cardCount,
			publish: result.card.publish,
			cardID: result.card.cardID,
			cardName: result.card.cardName,
			cardImage: result.card.cardImage,
			joiningFee: result.card.joiningFee,
			annualFee: result.card.annualFee,
			minMonthlyIncome: result.card.minMonthlyIncome,
			annualPercentageRate: result.card.annualPercentageRate,
			cardType: result.card.cardType,
			employmentType: result.card.employmentType,
			networkType: result.card.networkType,
			urlSlug: result.card.urlSlug,
			overAllRating: result.card.overAllRating,
			statsCount: result.card.statsCount,
			datecreated: result.card.datecreated.toISOString(),
			rewardPoints: result.card.rewardPoints,
			bestFor: result.card.bestFor,
			totalCards: result.card.totalCards,
			rewardRate: result.card.rewardRate,
			referralLink: result.card.referralLink,
			features: result.card.features.map((feature) => ({
				cardFeatureID: feature.cardFeatureID,
				cardID: feature.cardID,
				serialNumber: feature.serialNumber,
				heading: feature.heading,
				description: feature.description,
			})),
			similarity: result.similarity,
			matchReason: result.matchReason,
		}));

		return NextResponse.json({
			query,
			results: transformedResults,
			searchType: "semantic",
			totalResults: transformedResults.length,
			threshold,
		});
	} catch (error) {
		console.error("Search API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	} finally {
		// No need to disconnect with singleton pattern
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const query = searchParams.get("q") || searchParams.get("query");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const threshold = Number.parseFloat(searchParams.get("threshold") || "0.7");

		if (!query) {
			return NextResponse.json(
				{ error: "Query parameter 'q' or 'query' is required" },
				{ status: 400 },
			);
		}

		// Create a mock request object to reuse POST logic
		const mockRequest = {
			json: async () => ({
				query,
				limit,
				threshold,
			}),
		} as NextRequest;

		return await POST(mockRequest);
	} catch (error) {
		console.error("Search GET request error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	} finally {
		// No need to disconnect with singleton pattern
	}
}
