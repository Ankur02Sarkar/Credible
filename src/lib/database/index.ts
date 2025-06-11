import { PrismaClient } from "@prisma/client";

// Singleton pattern to prevent multiple database connections
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log:
			process.env.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
		errorFormat: "pretty",
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

// Connection helper
export async function connectToDatabase() {
	try {
		await prisma.$connect();
		console.log("✅ Database connected successfully");
	} catch (error) {
		console.error("❌ Database connection failed:", error);
		throw error;
	}
}

// Disconnect helper
export async function disconnectFromDatabase() {
	try {
		await prisma.$disconnect();
		console.log("✅ Database disconnected successfully");
	} catch (error) {
		console.error("❌ Database disconnection failed:", error);
		throw error;
	}
}

// Health check helper
export async function checkDatabaseHealth() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return { status: "healthy", message: "Database is responsive" };
	} catch (error) {
		return {
			status: "unhealthy",
			message: "Database is not responsive",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Transaction helper
export async function withTransaction<T>(
	callback: (prisma: PrismaClient) => Promise<T>,
): Promise<T> {
	return await prisma.$transaction(callback);
}

// Batch operation helper
export async function executeBatch(operations: any[]) {
	try {
		const results = await prisma.$transaction(operations);
		return { success: true, results };
	} catch (error) {
		console.error("Batch operation failed:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Soft delete helper (if implementing soft deletes)
export function withSoftDelete<T extends Record<string, any>>(
	model: T,
	deletedField = "deletedAt",
) {
	return {
		...model,
		delete: async (args: any) => {
			return model.update({
				...args,
				data: { [deletedField]: new Date() },
			});
		},
		deleteMany: async (args: any) => {
			return model.updateMany({
				...args,
				data: { [deletedField]: new Date() },
			});
		},
	};
}

// Export prisma as default
export default prisma;
