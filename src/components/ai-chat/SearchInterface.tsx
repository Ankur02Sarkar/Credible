"use client";

import {
	Clock,
	Filter,
	Search,
	Sparkles,
	TrendingUp,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";

interface SearchInterfaceProps {
	onSearch: (query: string) => Promise<void>;
	suggestedQueries: string[];
	recentQueries: string[];
	loading?: boolean;
	className?: string;
}

export function SearchInterface({
	onSearch,
	suggestedQueries,
	recentQueries,
	loading = false,
	className,
}: SearchInterfaceProps) {
	const [query, setQuery] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
				setIsExpanded(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearch = async () => {
		if (!query.trim()) return;

		setShowSuggestions(false);
		setIsExpanded(false);

		// Add to recent queries
		const updatedRecent = [
			query,
			...recentQueries.filter((q) => q !== query),
		].slice(0, 5);
		localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

		await onSearch(query.trim());
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSearch();
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
			setIsExpanded(false);
		}
	};

	const handleQuerySelect = (selectedQuery: string) => {
		setQuery(selectedQuery);
		setShowSuggestions(false);
		setTimeout(() => handleSearch(), 100);
	};

	const handleFocus = () => {
		setIsExpanded(true);
		setShowSuggestions(true);
	};

	const clearQuery = () => {
		setQuery("");
		inputRef.current?.focus();
	};

	return (
		<div
			className={cn("relative mx-auto w-full max-w-4xl", className)}
			ref={containerRef}
		>
			{/* Main Search Container */}
			<div
				className={cn(
					"relative transition-all duration-300",
					glassmorphism.container,
					glassGradients.primary,
					"border border-white/10 dark:border-white/5",
					"rounded-2xl shadow-2xl",
					isExpanded && "ring-2 ring-blue-500/30",
				)}
			>
				{/* Search Input */}
				<div className="flex items-center gap-4 p-4">
					<div className="relative flex-shrink-0">
						<Search
							className={cn(
								"h-6 w-6 transition-colors duration-200",
								isExpanded ? "text-blue-400" : "text-muted-foreground",
							)}
						/>
						{loading && (
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
							</div>
						)}
					</div>

					<div className="relative flex-1">
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyPress={handleKeyPress}
							onFocus={handleFocus}
							placeholder="Ask me about credit cards... (e.g., 'Best cards for travel with lounge access')"
							disabled={loading}
							className={cn(
								"w-full bg-transparent font-medium text-lg",
								"placeholder:text-muted-foreground/70",
								"focus:outline-none",
								"disabled:cursor-not-allowed disabled:opacity-50",
							)}
						/>

						{query && (
							<button
								onClick={clearQuery}
								className={cn(
									"-translate-y-1/2 absolute top-1/2 right-0",
									"rounded-full p-1 transition-all duration-200",
									"hover:bg-white/10 dark:hover:bg-black/20",
									"text-muted-foreground hover:text-foreground",
								)}
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={handleSearch}
							disabled={!query.trim() || loading}
							className={cn(
								"rounded-xl px-6 py-3 font-medium transition-all duration-300",
								"flex items-center gap-2",
								"bg-gradient-to-r from-blue-600 to-purple-600",
								"hover:from-blue-500 hover:to-purple-500",
								"text-white shadow-lg hover:shadow-xl",
								"disabled:cursor-not-allowed disabled:opacity-50",
								"transform hover:scale-105 active:scale-95",
							)}
						>
							<Sparkles className="h-4 w-4" />
							<span>Search</span>
						</button>
					</div>
				</div>

				{/* AI Indicator */}
				<div className="absolute top-2 right-2">
					<div
						className={cn(
							"flex items-center gap-1 rounded-full px-2 py-1 font-medium text-xs",
							"bg-gradient-to-r from-purple-500/20 to-blue-500/20",
							"border border-purple-500/30",
							"text-purple-300",
						)}
					>
						<Zap className="h-3 w-3" />
						<span>AI Powered</span>
					</div>
				</div>
			</div>

			{/* Suggestions Dropdown */}
			{showSuggestions && (isExpanded || query) && (
				<div
					className={cn(
						"absolute top-full right-0 left-0 z-[9999] mt-2",
						"overflow-hidden rounded-xl shadow-2xl",
						glassmorphism.dropdown,
						"border border-white/10 dark:border-white/5",
						"fade-in-0 zoom-in-95 animate-in duration-200",
					)}
				>
					{/* Recent Queries */}
					{recentQueries.length > 0 && !query && (
						<div className="border-white/10 border-b p-4 dark:border-white/5">
							<div className="mb-3 flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium text-foreground text-sm">
									Recent Searches
								</span>
							</div>
							<div className="space-y-2">
								{recentQueries.slice(0, 3).map((recentQuery, index) => (
									<button
										key={index}
										onClick={() => handleQuerySelect(recentQuery)}
										className={cn(
											"w-full rounded-lg px-3 py-2 text-left text-sm",
											"transition-all duration-200",
											"hover:bg-white/10 dark:hover:bg-black/20",
											"text-muted-foreground hover:text-foreground",
										)}
									>
										{recentQuery}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Suggested Queries */}
					{suggestedQueries.length > 0 && (
						<div className="p-4">
							<div className="mb-3 flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium text-foreground text-sm">
									{query ? "Related Suggestions" : "Popular Searches"}
								</span>
							</div>
							<div className="space-y-2">
								{suggestedQueries
									.filter(
										(suggestion) =>
											!query ||
											suggestion.toLowerCase().includes(query.toLowerCase()),
									)
									.slice(0, 5)
									.map((suggestion, index) => (
										<button
											key={index}
											onClick={() => handleQuerySelect(suggestion)}
											className={cn(
												"w-full rounded-lg px-3 py-2 text-left text-sm",
												"transition-all duration-200",
												"hover:bg-white/10 dark:hover:bg-black/20",
												"group text-foreground",
												"flex items-center justify-between",
											)}
										>
											<span>{suggestion}</span>
											<Sparkles className="h-3 w-3 text-purple-400 opacity-0 transition-opacity group-hover:opacity-100" />
										</button>
									))}
							</div>
						</div>
					)}

					{/* Quick Filters */}
					<div className="border-white/10 border-t p-4 dark:border-white/5">
						<div className="mb-3 flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-foreground text-sm">
								Quick Filters
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{[
								"No Annual Fee",
								"Travel Cards",
								"Cashback",
								"Premium",
								"First Timer",
								"High Income",
							].map((filter, index) => (
								<button
									key={index}
									onClick={() =>
										handleQuerySelect(
											`Best ${filter.toLowerCase()} credit cards`,
										)
									}
									className={cn(
										"rounded-lg px-3 py-1.5 font-medium text-xs",
										"transition-all duration-200",
										glassmorphism.button,
										"border border-white/15 dark:border-white/8",
										"hover:bg-white/10 dark:hover:bg-black/20",
										"hover:scale-105",
									)}
								>
									{filter}
								</button>
							))}
						</div>
					</div>

					{/* AI Tips */}
					{!query && (
						<div
							className={cn(
								"border-white/10 border-t p-4 dark:border-white/5",
								"bg-gradient-to-r from-blue-500/5 to-purple-500/5",
							)}
						>
							<div className="flex items-start gap-2">
								<Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
								<div className="text-muted-foreground text-sm">
									<p className="mb-1 font-medium text-foreground">
										💡 Pro Tip:
									</p>
									<p>
										Try natural language like "Show me travel cards under ₹5000
										annual fee" or "Compare HDFC and Axis premium cards"
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Search Examples */}
			{!isExpanded && !query && (
				<div className="mt-4 flex flex-wrap justify-center gap-2">
					{[
						"Cards with lounge access",
						"Best for fuel cashback",
						"No joining fee cards",
						"Premium travel cards",
					].map((example, index) => (
						<button
							key={index}
							onClick={() => {
								setQuery(example);
								setIsExpanded(true);
								inputRef.current?.focus();
							}}
							className={cn(
								"rounded-lg px-3 py-1.5 text-xs",
								"transition-all duration-200",
								glassmorphism.button,
								"border border-white/10 dark:border-white/5",
								"hover:bg-white/10 dark:hover:bg-black/20",
								"text-muted-foreground hover:text-foreground",
								"hover:scale-105",
							)}
						>
							{example}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
