import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Gemini AI for embeddings
const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
);

interface CreditCardData {
	cardIssuerName: string | null;
	cardLogo: string | null;
	cardIssuerID: string | null;
	issuerImage: string;
	issuerSlug: string;
	isFeatured: number;
	cardCount: number | null;
	publish: number;
	cardID: string;
	cardName: string;
	cardImage: string;
	joiningFee: string;
	annualFee: string;
	minMonthlyIncome: number;
	annualPercentageRate: string;
	cardType: string;
	employmentType: string;
	networkType: string | null;
	urlSlug: string;
	overAllRating: number;
	statsCount: number;
	datecreated: string;
	rewardPoints: string | null;
	bestFor: string;
	totalCards: number | null;
	rewardRate: string;
	referralLink: string | null;
}

interface CardFeatureData {
	cardFeatureID: string | null;
	cardID: string;
	serialNumber: number | null;
	heading: string;
	description: string | null;
}

interface SeedData {
	cardIssuer: CreditCardData[];
	cardFeatureList: CardFeatureData[];
}

// Placeholder for the actual data - you'll replace this with your test.json data
const SEED_DATA: SeedData = {
	cardIssuer: [],
	cardFeatureList: [],
};

// Utility function to generate text embeddings using Gemini
async function generateEmbedding(text: string): Promise<number[]> {
	try {
		const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
		const result = await model.embedContent(text);
		const embedding = result.embedding;
		return embedding.values || [];
	} catch (error) {
		console.error("Error generating embedding:", error);
		// Return a zero vector as fallback
		return new Array(768).fill(0);
	}
}

// Function to create comprehensive text content for embeddings
function createCardEmbeddingContent(
	card: CreditCardData,
	features: CardFeatureData[],
): string {
	const cardFeatures = features.filter((f) => f.cardID === card.cardID);

	return `
    ${card.cardName}
    Card Type: ${card.cardType}
    Best For: ${card.bestFor}
    Issuer: ${card.cardIssuerName || "Unknown"}
    Network: ${card.networkType || "Unknown"}
    Employment Type: ${card.employmentType}
    Joining Fee: ${card.joiningFee}
    Annual Fee: ${card.annualFee}
    Minimum Monthly Income: ₹${card.minMonthlyIncome.toLocaleString()}
    Reward Rate: ${card.rewardRate}
    Rating: ${card.overAllRating}/5 (${card.statsCount} reviews)
    Features: ${cardFeatures.map((f) => `${f.heading}: ${f.description || ""}`).join(", ")}
    Benefits: ${cardFeatures.map((f) => f.heading).join(", ")}
  `.trim();
}

// Function to seed card types
async function seedCardTypes(cards: CreditCardData[]) {
	console.log("Seeding card types...");

	const uniqueCardTypes = [...new Set(cards.map((card) => card.cardType))];

	for (const typeName of uniqueCardTypes) {
		await prisma.cardType.upsert({
			where: { typeName },
			update: {},
			create: {
				typeID: `TYPE_${typeName.toUpperCase().replace(/\s+/g, "_")}`,
				typeName,
				description: `${typeName} credit cards`,
				isActive: true,
			},
		});
	}

	console.log(`✓ Seeded ${uniqueCardTypes.length} card types`);
}

// Function to seed network types
async function seedNetworkTypes(cards: CreditCardData[]) {
	console.log("Seeding network types...");

	const uniqueNetworkTypes = [
		...new Set(cards.map((card) => card.networkType).filter(Boolean)),
	];

	for (const networkName of uniqueNetworkTypes) {
		if (networkName) {
			await prisma.networkType.upsert({
				where: { networkName },
				update: {},
				create: {
					networkID: `NET_${networkName.toUpperCase().replace(/\s+/g, "_")}`,
					networkName,
					description: `${networkName} network cards`,
					isActive: true,
				},
			});
		}
	}

	console.log(`✓ Seeded ${uniqueNetworkTypes.length} network types`);
}

// Function to seed employment types
async function seedEmploymentTypes(cards: CreditCardData[]) {
	console.log("Seeding employment types...");

	const uniqueEmploymentTypes = [
		...new Set(cards.map((card) => card.employmentType)),
	];

	for (const employmentName of uniqueEmploymentTypes) {
		await prisma.employmentType.upsert({
			where: { employmentName },
			update: {},
			create: {
				employmentID: `EMP_${employmentName.toUpperCase().replace(/\s+/g, "_")}`,
				employmentName,
				description: `Cards for ${employmentName.toLowerCase()} individuals`,
				isActive: true,
			},
		});
	}

	console.log(`✓ Seeded ${uniqueEmploymentTypes.length} employment types`);
}

// Function to seed card issuers
async function seedCardIssuers(cards: CreditCardData[]) {
	console.log("Seeding card issuers...");

	const uniqueIssuers = cards.reduce((acc, card) => {
		if (card.cardIssuerID && card.cardIssuerName) {
			acc.set(card.cardIssuerID, {
				issuerID: card.cardIssuerID,
				issuerName: card.cardIssuerName,
				issuerSlug: card.issuerSlug,
				issuerImage: card.issuerImage,
				logo: card.cardLogo,
			});
		}
		return acc;
	}, new Map());

	for (const issuer of uniqueIssuers.values()) {
		await prisma.cardIssuer.upsert({
			where: { issuerID: issuer.issuerID },
			update: {
				issuerName: issuer.issuerName,
				issuerSlug: issuer.issuerSlug,
				issuerImage: issuer.issuerImage,
				logo: issuer.logo,
			},
			create: {
				issuerID: issuer.issuerID,
				issuerName: issuer.issuerName,
				issuerSlug: issuer.issuerSlug,
				issuerImage: issuer.issuerImage,
				logo: issuer.logo,
				isActive: true,
			},
		});
	}

	console.log(`✓ Seeded ${uniqueIssuers.size} card issuers`);
}

// Function to seed credit cards with embeddings
async function seedCreditCards(
	cards: CreditCardData[],
	features: CardFeatureData[],
) {
	console.log("Seeding credit cards...");

	let processedCount = 0;
	const totalCards = cards.length;

	for (const cardData of cards) {
		try {
			// Create or update the credit card
			const card = await prisma.creditCard.upsert({
				where: { cardID: cardData.cardID },
				update: {
					cardName: cardData.cardName,
					cardImage: cardData.cardImage,
					cardIssuerName: cardData.cardIssuerName,
					cardLogo: cardData.cardLogo,
					cardIssuerID: cardData.cardIssuerID,
					issuerImage: cardData.issuerImage,
					issuerSlug: cardData.issuerSlug,
					isFeatured: cardData.isFeatured,
					cardCount: cardData.cardCount,
					publish: cardData.publish,
					joiningFee: cardData.joiningFee,
					annualFee: cardData.annualFee,
					minMonthlyIncome: cardData.minMonthlyIncome,
					annualPercentageRate: cardData.annualPercentageRate,
					cardType: cardData.cardType,
					employmentType: cardData.employmentType,
					networkType: cardData.networkType,
					urlSlug: cardData.urlSlug,
					overAllRating: cardData.overAllRating,
					statsCount: cardData.statsCount,
					rewardPoints: cardData.rewardPoints,
					bestFor: cardData.bestFor,
					totalCards: cardData.totalCards,
					rewardRate: cardData.rewardRate,
					referralLink: cardData.referralLink,
				},
				create: {
					cardID: cardData.cardID,
					cardName: cardData.cardName,
					cardImage: cardData.cardImage,
					cardIssuerName: cardData.cardIssuerName,
					cardLogo: cardData.cardLogo,
					cardIssuerID: cardData.cardIssuerID,
					issuerImage: cardData.issuerImage,
					issuerSlug: cardData.issuerSlug,
					isFeatured: cardData.isFeatured,
					cardCount: cardData.cardCount,
					publish: cardData.publish,
					joiningFee: cardData.joiningFee,
					annualFee: cardData.annualFee,
					minMonthlyIncome: cardData.minMonthlyIncome,
					annualPercentageRate: cardData.annualPercentageRate,
					cardType: cardData.cardType,
					employmentType: cardData.employmentType,
					networkType: cardData.networkType,
					urlSlug: cardData.urlSlug,
					overAllRating: cardData.overAllRating,
					statsCount: cardData.statsCount,
					rewardPoints: cardData.rewardPoints,
					bestFor: cardData.bestFor,
					totalCards: cardData.totalCards,
					rewardRate: cardData.rewardRate,
					referralLink: cardData.referralLink,
					datecreated: new Date(cardData.datecreated),
				},
			});

			// Generate and store embeddings
			const embeddingContent = createCardEmbeddingContent(cardData, features);
			const embedding = await generateEmbedding(embeddingContent);

			// Store the embedding
			await prisma.cardEmbedding.upsert({
				where: {
					cardID_contentType: {
						cardID: cardData.cardID,
						contentType: "card_summary",
					},
				},
				update: {
					content: embeddingContent,
					embedding: embedding,
				},
				create: {
					cardID: cardData.cardID,
					content: embeddingContent,
					contentType: "card_summary",
					embedding: embedding,
				},
			});

			processedCount++;
			if (processedCount % 10 === 0) {
				console.log(`✓ Processed ${processedCount}/${totalCards} cards`);
			}

			// Add a small delay to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (error) {
			console.error(`Error processing card ${cardData.cardID}:`, error);
		}
	}

	console.log(`✓ Seeded ${processedCount} credit cards with embeddings`);
}

// Function to seed card features
async function seedCardFeatures(features: CardFeatureData[]) {
	console.log("Seeding card features...");

	let processedCount = 0;
	const totalFeatures = features.length;

	for (const featureData of features) {
		try {
			await prisma.cardFeature.upsert({
				where: {
					cardID_heading: {
						cardID: featureData.cardID,
						heading: featureData.heading,
					},
				},
				update: {
					cardFeatureID: featureData.cardFeatureID,
					serialNumber: featureData.serialNumber,
					description: featureData.description,
				},
				create: {
					cardFeatureID: featureData.cardFeatureID,
					cardID: featureData.cardID,
					serialNumber: featureData.serialNumber,
					heading: featureData.heading,
					description: featureData.description,
				},
			});

			processedCount++;
			if (processedCount % 50 === 0) {
				console.log(`✓ Processed ${processedCount}/${totalFeatures} features`);
			}
		} catch (error) {
			console.error(
				`Error processing feature for card ${featureData.cardID}:`,
				error,
			);
		}
	}

	console.log(`✓ Seeded ${processedCount} card features`);
}

// Function to generate feature-specific embeddings
async function generateFeatureEmbeddings(features: CardFeatureData[]) {
	console.log("Generating feature embeddings...");

	const featuresByCard = features.reduce(
		(acc, feature) => {
			if (!acc[feature.cardID]) {
				acc[feature.cardID] = [];
			}
			acc[feature.cardID].push(feature);
			return acc;
		},
		{} as Record<string, CardFeatureData[]>,
	);

	let processedCards = 0;
	const totalCards = Object.keys(featuresByCard).length;

	for (const [cardID, cardFeatures] of Object.entries(featuresByCard)) {
		try {
			// Group features by type/category for better embeddings
			const featuresText = cardFeatures
				.map((f) => `${f.heading}: ${f.description || ""}`)
				.join("\n");

			const embedding = await generateEmbedding(featuresText);

			await prisma.cardEmbedding.upsert({
				where: {
					cardID_contentType: {
						cardID: cardID,
						contentType: "features",
					},
				},
				update: {
					content: featuresText,
					embedding: embedding,
				},
				create: {
					cardID: cardID,
					content: featuresText,
					contentType: "features",
					embedding: embedding,
				},
			});

			processedCards++;
			if (processedCards % 10 === 0) {
				console.log(
					`✓ Generated embeddings for ${processedCards}/${totalCards} cards`,
				);
			}

			// Add delay to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (error) {
			console.error(
				`Error generating feature embeddings for card ${cardID}:`,
				error,
			);
		}
	}

	console.log(`✓ Generated feature embeddings for ${processedCards} cards`);
}

// Main seeding function
async function main() {
	try {
		console.log("Starting database seeding...");

		// Check if we have data to seed
		if (!SEED_DATA.cardIssuer.length) {
			console.log(
				"⚠️  No seed data found. Please add your credit card data to the SEED_DATA object.",
			);
			console.log(
				"   Replace the SEED_DATA constant with your actual data from test.json",
			);
			return;
		}

		// Seed reference data first
		await seedCardTypes(SEED_DATA.cardIssuer);
		await seedNetworkTypes(SEED_DATA.cardIssuer);
		await seedEmploymentTypes(SEED_DATA.cardIssuer);
		await seedCardIssuers(SEED_DATA.cardIssuer);

		// Seed main data
		await seedCreditCards(SEED_DATA.cardIssuer, SEED_DATA.cardFeatureList);
		await seedCardFeatures(SEED_DATA.cardFeatureList);

		// Generate embeddings for features
		await generateFeatureEmbeddings(SEED_DATA.cardFeatureList);

		console.log("🎉 Database seeding completed successfully!");
		console.log(`   - ${SEED_DATA.cardIssuer.length} credit cards`);
		console.log(`   - ${SEED_DATA.cardFeatureList.length} card features`);
		console.log("   - Generated embeddings for semantic search");
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Execute the seeding if this file is run directly
if (require.main === module) {
	main().catch((error) => {
		console.error("Fatal error during seeding:", error);
		process.exit(1);
	});
}

export { main as seedDatabase, SEED_DATA };
