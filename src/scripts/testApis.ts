#!/usr/bin/env tsx

import fetch from "node-fetch";

// Base URL for local development
const BASE_URL = "http://localhost:3000";

interface TestResult {
	endpoint: string;
	method: string;
	status: "PASS" | "FAIL";
	statusCode?: number;
	error?: string;
	responseTime?: number;
	responseSize?: number;
}

class ApiTester {
	private results: TestResult[] = [];

	private async makeRequest(
		endpoint: string,
		method: "GET" | "POST" = "GET",
		body?: any,
	): Promise<TestResult> {
		const startTime = Date.now();

		try {
			const response = await fetch(`${BASE_URL}${endpoint}`, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			const responseTime = Date.now() - startTime;
			const data = await response.text();
			const responseSize = Buffer.byteLength(data, "utf8");

			if (response.ok) {
				return {
					endpoint,
					method,
					status: "PASS",
					statusCode: response.status,
					responseTime,
					responseSize,
				};
			} else {
				return {
					endpoint,
					method,
					status: "FAIL",
					statusCode: response.status,
					error: `HTTP ${response.status}: ${response.statusText}`,
					responseTime,
					responseSize,
				};
			}
		} catch (error) {
			const responseTime = Date.now() - startTime;
			return {
				endpoint,
				method,
				status: "FAIL",
				error: error instanceof Error ? error.message : "Unknown error",
				responseTime,
			};
		}
	}

	async testCardsApi() {
		console.log("\n🔍 Testing Cards API...");

		// Test GET /api/cards
		const getResult = await this.makeRequest("/api/cards");
		this.results.push(getResult);
		this.logResult(getResult);

		// Test POST /api/cards with filters
		const postResult = await this.makeRequest("/api/cards", "POST", {
			sortby: "featured",
			privileges: "",
			emptype: "",
			incomeRange: "",
			page: 0,
			limit: 5,
		});
		this.results.push(postResult);
		this.logResult(postResult);

		// Test POST /api/cards with specific filters
		const filterResult = await this.makeRequest("/api/cards", "POST", {
			sortby: "rating",
			privileges: "Premium",
			emptype: "Salaried",
			incomeRange: "50000-100000",
			page: 0,
			limit: 3,
		});
		this.results.push(filterResult);
		this.logResult(filterResult);
	}

	async testSearchApi() {
		console.log("\n🔍 Testing Search API...");

		// Test semantic search
		const semanticResult = await this.makeRequest("/api/search", "POST", {
			query: "best travel credit cards with airport lounge access",
			limit: 5,
			threshold: 0.6,
		});
		this.results.push(semanticResult);
		this.logResult(semanticResult);

		// Test GET search
		const getSearchResult = await this.makeRequest(
			"/api/search?q=cashback cards&limit=3",
		);
		this.results.push(getSearchResult);
		this.logResult(getSearchResult);

		// Test fallback search
		const fallbackResult = await this.makeRequest("/api/search", "POST", {
			query: "xyz unknown card type",
			limit: 3,
			threshold: 0.9,
		});
		this.results.push(fallbackResult);
		this.logResult(fallbackResult);
	}

	async testSuggestionsApi() {
		console.log("\n🔍 Testing Suggestions API...");

		// Test GET suggestions
		const getResult = await this.makeRequest("/api/suggestions");
		this.results.push(getResult);
		this.logResult(getResult);

		// Test popular suggestions
		const popularResult = await this.makeRequest(
			"/api/suggestions?type=popular&limit=5",
		);
		this.results.push(popularResult);
		this.logResult(popularResult);

		// Test AI generated suggestions
		const aiResult = await this.makeRequest(
			"/api/suggestions?type=ai_generated&limit=6",
		);
		this.results.push(aiResult);
		this.logResult(aiResult);

		// Test POST suggestions (logging user query)
		const postResult = await this.makeRequest("/api/suggestions", "POST", {
			query: "best premium cards",
			userId: "test-user-123",
			sessionId: "test-session-456",
		});
		this.results.push(postResult);
		this.logResult(postResult);
	}

	async testChatApi() {
		console.log("\n🔍 Testing Chat API...");

		// Test basic chat
		const chatResult = await this.makeRequest("/api/chat", "POST", {
			message: "What are the best credit cards for travel?",
			sessionId: "test-session-789",
			userId: "test-user-456",
		});
		this.results.push(chatResult);
		this.logResult(chatResult);

		// Test chat with context
		const contextResult = await this.makeRequest("/api/chat", "POST", {
			message: "Tell me more about the fees",
			sessionId: "test-session-789",
			userId: "test-user-456",
			context: {
				previousMessages: [
					{
						role: "user",
						content: "What are the best credit cards for travel?",
						timestamp: new Date(),
					},
				],
			},
		});
		this.results.push(contextResult);
		this.logResult(contextResult);

		// Test GET chat history
		const historyResult = await this.makeRequest(
			"/api/chat?sessionId=test-session-789",
		);
		this.results.push(historyResult);
		this.logResult(historyResult);
	}

	async testErrorHandling() {
		console.log("\n🔍 Testing Error Handling...");

		// Test invalid search query
		const invalidSearchResult = await this.makeRequest("/api/search", "POST", {
			query: "",
		});
		this.results.push(invalidSearchResult);
		this.logResult(invalidSearchResult);

		// Test invalid chat message
		const invalidChatResult = await this.makeRequest("/api/chat", "POST", {
			message: "",
		});
		this.results.push(invalidChatResult);
		this.logResult(invalidChatResult);

		// Test missing query parameter in suggestions
		const invalidSuggestionsResult = await this.makeRequest(
			"/api/suggestions",
			"POST",
			{},
		);
		this.results.push(invalidSuggestionsResult);
		this.logResult(invalidSuggestionsResult);
	}

	private logResult(result: TestResult) {
		const status = result.status === "PASS" ? "✅" : "❌";
		const timing = result.responseTime ? ` (${result.responseTime}ms)` : "";
		const size = result.responseSize
			? ` [${(result.responseSize / 1024).toFixed(2)}KB]`
			: "";

		console.log(
			`${status} ${result.method} ${result.endpoint}${timing}${size}`,
		);

		if (result.error) {
			console.log(`   Error: ${result.error}`);
		}

		if (result.statusCode) {
			console.log(`   Status: ${result.statusCode}`);
		}
	}

	printSummary() {
		console.log("\n📊 Test Summary");
		console.log("=".repeat(50));

		const passed = this.results.filter((r) => r.status === "PASS").length;
		const failed = this.results.filter((r) => r.status === "FAIL").length;
		const total = this.results.length;

		console.log(`Total Tests: ${total}`);
		console.log(`✅ Passed: ${passed}`);
		console.log(`❌ Failed: ${failed}`);
		console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

		const avgResponseTime =
			this.results
				.filter((r) => r.responseTime)
				.reduce((sum, r) => sum + (r.responseTime || 0), 0) /
			this.results.length;

		console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);

		if (failed > 0) {
			console.log("\n❌ Failed Tests:");
			this.results
				.filter((r) => r.status === "FAIL")
				.forEach((r) => {
					console.log(`   ${r.method} ${r.endpoint}: ${r.error}`);
				});
		}

		console.log("\n🎯 Performance Summary:");
		const fastTests = this.results.filter(
			(r) => (r.responseTime || 0) < 1000,
		).length;
		const slowTests = this.results.filter(
			(r) => (r.responseTime || 0) >= 2000,
		).length;

		console.log(`   Fast (< 1s): ${fastTests}`);
		console.log(`   Slow (>= 2s): ${slowTests}`);
	}

	async runAllTests() {
		console.log("🚀 Starting API Integration Tests...");
		console.log(`Testing against: ${BASE_URL}`);

		try {
			await this.testCardsApi();
			await this.testSearchApi();
			await this.testSuggestionsApi();
			await this.testChatApi();
			await this.testErrorHandling();

			this.printSummary();

			const failedCount = this.results.filter(
				(r) => r.status === "FAIL",
			).length;
			if (failedCount > 0) {
				process.exit(1);
			} else {
				console.log("\n🎉 All tests passed!");
				process.exit(0);
			}
		} catch (error) {
			console.error("\n💥 Test suite failed:", error);
			process.exit(1);
		}
	}
}

// Database health check
async function checkDatabaseHealth() {
	console.log("🔍 Checking database health...");

	try {
		const response = await fetch(`${BASE_URL}/api/health`);
		if (response.ok) {
			console.log("✅ Database is healthy");
			return true;
		} else {
			console.log("⚠️  Database health check endpoint not found (optional)");
			return true; // Continue tests even if health endpoint doesn't exist
		}
	} catch (error) {
		console.log("⚠️  Could not check database health, continuing with tests...");
		return true;
	}
}

// Main execution
async function main() {
	console.log("🧪 Credit Card API Integration Test Suite");
	console.log("==========================================");

	// Check if server is running
	try {
		await fetch(`${BASE_URL}/api/cards?limit=1`);
	} catch (error) {
		console.error(`❌ Cannot connect to server at ${BASE_URL}`);
		console.error("Make sure your Next.js server is running with: npm run dev");
		process.exit(1);
	}

	await checkDatabaseHealth();

	const tester = new ApiTester();
	await tester.runAllTests();
}

// Run if this file is executed directly
if (require.main === module) {
	main().catch((error) => {
		console.error("💥 Unexpected error:", error);
		process.exit(1);
	});
}

export { ApiTester };
