// app/api/chat/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { geminiService } from "~/lib/ai/gemini-service";
import { prisma } from "~/lib/database";

interface ChatRequest {
	message: string;
	sessionId?: string;
	userId?: string;
	context?: {
		cardIds?: string[];
		previousMessages?: Array<{
			role: "user" | "assistant";
			content: string;
			timestamp: Date;
		}>;
	};
}

export async function POST(req: NextRequest) {
	try {
		const { message, sessionId, userId, context }: ChatRequest =
			await req.json();

		if (!message || message.trim().length === 0) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 },
			);
		}

		// Generate session ID if not provided
		const currentSessionId =
			sessionId ||
			`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Create or get chat session
		let chatSession = await prisma.chatSession.findUnique({
			where: { sessionId: currentSessionId },
			include: {
				messages: {
					orderBy: { createdAt: "desc" },
					take: 10, // Last 10 messages for context
				},
			},
		});

		if (!chatSession) {
			chatSession = await prisma.chatSession.create({
				data: {
					sessionId: currentSessionId,
					userId: userId || null,
					isActive: true,
				},
				include: {
					messages: true,
				},
			});
		}

		// Store user message
		await prisma.chatMessage.create({
			data: {
				sessionId: currentSessionId,
				role: "user",
				content: message.trim(),
				metadata: context
					? {
							cardIds: context.cardIds || [],
							timestamp: new Date().toISOString(),
						}
					: {},
			},
		});

		// Prepare context for AI
		const previousMessages = chatSession.messages
			.map((msg) => ({
				role: msg.role as "user" | "assistant",
				content: msg.content,
				timestamp: msg.createdAt,
			}))
			.reverse(); // Reverse to get chronological order

		// Get relevant cards based on context or fetch from database
		let relevantCards = [];
		let relevantFeatures = [];

		if (context?.cardIds && context.cardIds.length > 0) {
			// Get specific cards mentioned in context
			const dbCards = await prisma.creditCard.findMany({
				where: {
					cardID: { in: context.cardIds },
					publish: 1,
				},
				include: {
					features: {
						orderBy: { serialNumber: "asc" },
					},
				},
			});

			relevantCards = dbCards.map(transformDbCard);
			relevantFeatures = dbCards.flatMap((card) =>
				card.features.map(transformDbFeature),
			);
		} else {
			// Get general card data for context
			const dbCards = await prisma.creditCard.findMany({
				where: { publish: 1 },
				include: {
					features: {
						orderBy: { serialNumber: "asc" },
					},
				},
				take: 50, // Limit for performance
				orderBy: [{ isFeatured: "desc" }, { overAllRating: "desc" }],
			});

			relevantCards = dbCards.map(transformDbCard);
			relevantFeatures = dbCards.flatMap((card) =>
				card.features.map(transformDbFeature),
			);
		}

		// Generate AI response
		const aiResponse = await geminiService.generateChatResponse(
			message.trim(),
			{
				cards: relevantCards,
				features: relevantFeatures,
				previousMessages,
			},
		);

		// Store AI response
		const assistantMessage = await prisma.chatMessage.create({
			data: {
				sessionId: currentSessionId,
				role: "assistant",
				content: aiResponse,
				metadata: {
					model: "gemini-2.0-flash-lite",
					timestamp: new Date().toISOString(),
					relevantCardCount: relevantCards.length,
				},
			},
		});

		// Update session activity
		await prisma.chatSession.update({
			where: { sessionId: currentSessionId },
			data: { updatedAt: new Date() },
		});

		return NextResponse.json({
			sessionId: currentSessionId,
			message: aiResponse,
			timestamp: assistantMessage.createdAt,
			metadata: {
				relevantCardCount: relevantCards.length,
				conversationLength: previousMessages.length + 2, // +2 for current exchange
			},
		});
	} catch (error) {
		console.error("Chat API error:", error);
		return NextResponse.json(
			{
				error: "Failed to process chat message",
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			},
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const sessionId = searchParams.get("sessionId");
		const userId = searchParams.get("userId");
		const limit = Number.parseInt(searchParams.get("limit") || "20");

		if (!sessionId && !userId) {
			return NextResponse.json(
				{ error: "Either sessionId or userId is required" },
				{ status: 400 },
			);
		}

		// Build where clause
		const whereClause: any = {};
		if (sessionId) {
			whereClause.sessionId = sessionId;
		} else if (userId) {
			whereClause.userId = userId;
		}

		// Get chat history
		const chatSessions = await prisma.chatSession.findMany({
			where: whereClause,
			include: {
				messages: {
					orderBy: { createdAt: "asc" },
					take: limit,
				},
			},
			orderBy: { updatedAt: "desc" },
			take: sessionId ? 1 : 10, // Single session or recent sessions
		});

		const formattedSessions = chatSessions.map((session) => ({
			sessionId: session.sessionId,
			userId: session.userId,
			isActive: session.isActive,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			messages: session.messages.map((msg) => ({
				role: msg.role,
				content: msg.content,
				timestamp: msg.createdAt,
				metadata: msg.metadata,
			})),
			messageCount: session.messages.length,
		}));

		return NextResponse.json({
			sessions: formattedSessions,
			totalSessions: formattedSessions.length,
		});
	} catch (error) {
		console.error("GET Chat API error:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve chat history" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const sessionId = searchParams.get("sessionId");
		const userId = searchParams.get("userId");

		if (!sessionId && !userId) {
			return NextResponse.json(
				{ error: "Either sessionId or userId is required" },
				{ status: 400 },
			);
		}

		if (sessionId) {
			// Delete specific session
			await prisma.chatSession.delete({
				where: { sessionId },
			});

			return NextResponse.json({
				message: "Chat session deleted successfully",
				sessionId,
			});
		} else if (userId) {
			// Delete all sessions for user
			const deletedSessions = await prisma.chatSession.deleteMany({
				where: { userId },
			});

			return NextResponse.json({
				message: "All chat sessions deleted successfully",
				deletedCount: deletedSessions.count,
				userId,
			});
		}
	} catch (error) {
		console.error("DELETE Chat API error:", error);
		return NextResponse.json(
			{ error: "Failed to delete chat session(s)" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

// Helper function to transform database card to interface
function transformDbCard(dbCard: any) {
	return {
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
}

// Helper function to transform database feature to interface
function transformDbFeature(dbFeature: any) {
	return {
		cardFeatureID: dbFeature.cardFeatureID,
		cardID: dbFeature.cardID,
		serialNumber: dbFeature.serialNumber,
		heading: dbFeature.heading,
		description: dbFeature.description,
	};
}
