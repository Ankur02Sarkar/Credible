"use client";

import {
	Bot,
	Loader2,
	Maximize2,
	MessageSquare,
	Minimize2,
	Send,
	Sparkles,
	User,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "~/lib/ai/gemini-service";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";

interface ChatInterfaceProps {
	onQuery: (query: string) => Promise<void>;
	suggestedQueries: string[];
	loading?: boolean;
	className?: string;
}

export function ChatInterface({
	onQuery,
	suggestedQueries,
	loading = false,
	className,
}: ChatInterfaceProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: "assistant",
			content:
				"Hi! I'm your AI credit card advisor. Ask me anything about finding the perfect credit card for your needs!",
			timestamp: new Date(),
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async () => {
		if (!inputValue.trim() || loading) return;

		const userMessage: ChatMessage = {
			role: "user",
			content: inputValue.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsTyping(true);

		try {
			await onQuery(userMessage.content);

			// Simulate AI response (this would be replaced with actual AI response)
			setTimeout(() => {
				const aiResponse: ChatMessage = {
					role: "assistant",
					content: `I found some great credit card options based on your query: "${userMessage.content}". Check out the filtered results below!`,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, aiResponse]);
				setIsTyping(false);
			}, 1000);
		} catch (error) {
			const errorMessage: ChatMessage = {
				role: "assistant",
				content:
					"I apologize, but I encountered an error processing your request. Please try again.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			setIsTyping(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleSuggestedQuery = (query: string) => {
		setInputValue(query);
		inputRef.current?.focus();
	};

	if (!isOpen) {
		return (
			<div className={cn("fixed right-6 bottom-6 z-[9999]", className)}>
				<button
					onClick={() => setIsOpen(true)}
					className={cn(
						"group relative flex items-center gap-3 rounded-2xl px-6 py-4",
						"transition-all duration-300 hover:scale-105",
						glassmorphism.button,
						glassGradients.primary,
						"border border-white/20 dark:border-white/10",
						"shadow-2xl hover:shadow-3xl",
						"animate-pulse-glow",
					)}
				>
					<div className="relative">
						<MessageSquare className="h-6 w-6 text-foreground" />
						<div className="-top-1 -right-1 absolute h-3 w-3 animate-pulse rounded-full bg-green-500" />
					</div>
					<span className="font-medium text-foreground">Ask AI</span>
					<Sparkles className="h-4 w-4 animate-pulse text-yellow-400" />
				</button>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"fixed right-6 bottom-6 z-[9999]",
				"h-[32rem] w-96",
				"flex flex-col",
				className,
			)}
		>
			<div
				className={cn(
					"flex flex-1 flex-col overflow-hidden rounded-2xl",
					glassmorphism.modal,
					glassGradients.card,
					"border border-white/10 dark:border-white/5",
					"shadow-2xl",
					isMinimized && "h-14",
				)}
			>
				{/* Header */}
				<div
					className={cn(
						"flex items-center justify-between border-white/10 border-b p-4 dark:border-white/5",
						glassmorphism.nav,
					)}
				>
					<div className="flex items-center gap-3">
						<div className="relative">
							<Bot className="h-6 w-6 text-blue-400" />
							<div className="-bottom-1 -right-1 absolute h-3 w-3 rounded-full border-2 border-background bg-green-500" />
						</div>
						<div>
							<h3 className="font-semibold text-foreground">AI Assistant</h3>
							<p className="text-muted-foreground text-xs">
								Credit Card Advisor
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsMinimized(!isMinimized)}
							className={cn(
								"rounded-lg p-2 transition-all duration-200",
								"hover:bg-white/10 dark:hover:bg-black/20",
								"text-muted-foreground hover:text-foreground",
							)}
						>
							{isMinimized ? (
								<Maximize2 className="h-4 w-4" />
							) : (
								<Minimize2 className="h-4 w-4" />
							)}
						</button>
						<button
							onClick={() => setIsOpen(false)}
							className={cn(
								"rounded-lg p-2 transition-all duration-200",
								"hover:bg-white/10 dark:hover:bg-black/20",
								"text-muted-foreground hover:text-foreground",
							)}
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				{!isMinimized && (
					<>
						{/* Messages */}
						<div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
							{messages.map((message, index) => (
								<div
									key={index}
									className={cn(
										"flex gap-3",
										message.role === "user" ? "justify-end" : "justify-start",
									)}
								>
									{message.role === "assistant" && (
										<div
											className={cn(
												"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
												glassmorphism.card,
												"border border-blue-500/20",
											)}
										>
											<Bot className="h-4 w-4 text-blue-400" />
										</div>
									)}

									<div
										className={cn(
											"max-w-[80%] rounded-2xl px-4 py-3",
											message.role === "user"
												? "ml-auto bg-blue-600 text-white"
												: cn(
														glassmorphism.card,
														"border border-white/10 dark:border-white/5",
													),
										)}
									>
										<p className="text-sm leading-relaxed">{message.content}</p>
										<p
											className={cn(
												"mt-1 text-xs opacity-70",
												message.role === "user"
													? "text-blue-100"
													: "text-muted-foreground",
											)}
										>
											{message.timestamp.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>

									{message.role === "user" && (
										<div
											className={cn(
												"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
												glassmorphism.card,
												"border border-green-500/20",
											)}
										>
											<User className="h-4 w-4 text-green-400" />
										</div>
									)}
								</div>
							))}

							{isTyping && (
								<div className="flex gap-3">
									<div
										className={cn(
											"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
											glassmorphism.card,
											"border border-blue-500/20",
										)}
									>
										<Bot className="h-4 w-4 text-blue-400" />
									</div>
									<div
										className={cn(
											"rounded-2xl px-4 py-3",
											glassmorphism.card,
											"border border-white/10 dark:border-white/5",
										)}
									>
										<div className="flex items-center gap-1">
											<div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
											<div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 delay-100" />
											<div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 delay-200" />
										</div>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</div>

						{/* Suggested Queries */}
						{messages.length <= 1 && suggestedQueries.length > 0 && (
							<div className="border-white/10 border-t p-4 dark:border-white/5">
								<p className="mb-3 text-muted-foreground text-xs">
									Try asking:
								</p>
								<div className="space-y-2">
									{suggestedQueries.slice(0, 3).map((query, index) => (
										<button
											key={index}
											onClick={() => handleSuggestedQuery(query)}
											className={cn(
												"w-full rounded-lg px-3 py-2 text-left text-sm",
												"transition-all duration-200",
												glassmorphism.button,
												"border border-white/10 dark:border-white/5",
												"hover:bg-white/10 dark:hover:bg-black/20",
												"hover:scale-[1.02]",
											)}
										>
											{query}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Input */}
						<div className="border-white/10 border-t p-4 dark:border-white/5">
							<div className="flex gap-2">
								<input
									ref={inputRef}
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Ask about credit cards..."
									disabled={loading}
									className={cn(
										"flex-1 rounded-xl px-4 py-3 text-sm",
										glassmorphism.input,
										"border border-white/20 dark:border-white/10",
										"focus:border-blue-500/50",
										"placeholder:text-muted-foreground",
										"disabled:cursor-not-allowed disabled:opacity-50",
									)}
								/>
								<button
									onClick={handleSendMessage}
									disabled={!inputValue.trim() || loading}
									className={cn(
										"rounded-xl px-4 py-3 transition-all duration-200",
										"bg-blue-600 hover:bg-blue-500",
										"font-medium text-white",
										"disabled:cursor-not-allowed disabled:opacity-50",
										"hover:scale-105 active:scale-95",
										"shadow-lg hover:shadow-xl",
									)}
								>
									{loading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Send className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
