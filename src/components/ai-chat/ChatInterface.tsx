"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, X, MessageSquare, Minimize2, Maximize2 } from "lucide-react";
import { cn, glassmorphism, glassGradients } from "~/lib/glassmorphism";
import type { ChatMessage } from "~/lib/ai/gemini-service";

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
      role: 'assistant',
      content: 'Hi! I\'m your AI credit card advisor. Ask me anything about finding the perfect credit card for your needs!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      await onQuery(userMessage.content);
      
      // Simulate AI response (this would be replaced with actual AI response)
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          role: 'assistant',
          content: `I found some great credit card options based on your query: "${userMessage.content}". Check out the filtered results below!`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      <div className={cn("fixed bottom-6 right-6 z-[9999]", className)}>
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "group relative flex items-center gap-3 px-6 py-4 rounded-2xl",
            "transition-all duration-300 hover:scale-105",
            glassmorphism.button,
            glassGradients.primary,
            "border border-white/20 dark:border-white/10",
            "shadow-2xl hover:shadow-3xl",
            "animate-pulse-glow"
          )}
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-foreground" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="font-medium text-foreground">Ask AI</span>
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[9999]",
      "w-96 h-[32rem]",
      "flex flex-col",
      className
    )}>
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden rounded-2xl",
        glassmorphism.modal,
        glassGradients.card,
        "border border-white/10 dark:border-white/5",
        "shadow-2xl",
        isMinimized && "h-14"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b border-white/10 dark:border-white/5",
          glassmorphism.nav
        )}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-6 h-6 text-blue-400" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Credit Card Advisor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-white/10 dark:hover:bg-black/20",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-white/10 dark:hover:bg-black/20",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      glassmorphism.card,
                      "border border-blue-500/20"
                    )}>
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] px-4 py-3 rounded-2xl",
                    message.role === 'user' 
                      ? "bg-blue-600 text-white ml-auto" 
                      : cn(glassmorphism.card, "border border-white/10 dark:border-white/5")
                  )}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1 opacity-70",
                      message.role === 'user' ? "text-blue-100" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      glassmorphism.card,
                      "border border-green-500/20"
                    )}>
                      <User className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    glassmorphism.card,
                    "border border-blue-500/20"
                  )}>
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl",
                    glassmorphism.card,
                    "border border-white/10 dark:border-white/5"
                  )}>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Queries */}
            {messages.length <= 1 && suggestedQueries.length > 0 && (
              <div className="p-4 border-t border-white/10 dark:border-white/5">
                <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
                <div className="space-y-2">
                  {suggestedQueries.slice(0, 3).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuery(query)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm",
                        "transition-all duration-200",
                        glassmorphism.button,
                        "border border-white/10 dark:border-white/5",
                        "hover:bg-white/10 dark:hover:bg-black/20",
                        "hover:scale-[1.02]"
                      )}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 dark:border-white/5">
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
                    "flex-1 px-4 py-3 rounded-xl text-sm",
                    glassmorphism.input,
                    "border border-white/20 dark:border-white/10",
                    "focus:border-blue-500/50",
                    "placeholder:text-muted-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || loading}
                  className={cn(
                    "px-4 py-3 rounded-xl transition-all duration-200",
                    "bg-blue-600 hover:bg-blue-500",
                    "text-white font-medium",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "hover:scale-105 active:scale-95",
                    "shadow-lg hover:shadow-xl"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
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