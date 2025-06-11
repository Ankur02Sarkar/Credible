"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Filter, X, TrendingUp, Clock, Zap } from "lucide-react";
import { cn, glassmorphism, glassGradients } from "~/lib/glassmorphism";

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
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setShowSuggestions(false);
    setIsExpanded(false);
    
    // Add to recent queries
    const updatedRecent = [query, ...recentQueries.filter(q => q !== query)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    await onSearch(query.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
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
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)} ref={containerRef}>
      {/* Main Search Container */}
      <div className={cn(
        "relative transition-all duration-300",
        glassmorphism.container,
        glassGradients.primary,
        "border border-white/10 dark:border-white/5",
        "rounded-2xl shadow-2xl",
        isExpanded && "ring-2 ring-blue-500/30"
      )}>
        {/* Search Input */}
        <div className="flex items-center p-4 gap-4">
          <div className="relative flex-shrink-0">
            <Search className={cn(
              "w-6 h-6 transition-colors duration-200",
              isExpanded ? "text-blue-400" : "text-muted-foreground"
            )} />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 relative">
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
                "w-full bg-transparent text-lg font-medium",
                "placeholder:text-muted-foreground/70",
                "focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            
            {query && (
              <button
                onClick={clearQuery}
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2",
                  "p-1 rounded-full transition-all duration-200",
                  "hover:bg-white/10 dark:hover:bg-black/20",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all duration-300",
                "flex items-center gap-2",
                "bg-gradient-to-r from-blue-600 to-purple-600",
                "hover:from-blue-500 hover:to-purple-500",
                "text-white shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transform hover:scale-105 active:scale-95"
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* AI Indicator */}
        <div className="absolute top-2 right-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            "bg-gradient-to-r from-purple-500/20 to-blue-500/20",
            "border border-purple-500/30",
            "text-purple-300"
          )}>
            <Zap className="w-3 h-3" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (isExpanded || query) && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 z-[9999]",
          "rounded-xl overflow-hidden shadow-2xl",
          glassmorphism.dropdown,
          "border border-white/10 dark:border-white/5",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          {/* Recent Queries */}
          {recentQueries.length > 0 && !query && (
            <div className="p-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Recent Searches</span>
              </div>
              <div className="space-y-2">
                {recentQueries.slice(0, 3).map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuerySelect(recentQuery)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm",
                      "transition-all duration-200",
                      "hover:bg-white/10 dark:hover:bg-black/20",
                      "text-muted-foreground hover:text-foreground"
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
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {query ? 'Related Suggestions' : 'Popular Searches'}
                </span>
              </div>
              <div className="space-y-2">
                {suggestedQueries
                  .filter(suggestion => 
                    !query || suggestion.toLowerCase().includes(query.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuerySelect(suggestion)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm",
                        "transition-all duration-200",
                        "hover:bg-white/10 dark:hover:bg-black/20",
                        "text-foreground group",
                        "flex items-center justify-between"
                      )}
                    >
                      <span>{suggestion}</span>
                      <Sparkles className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Filters */}
          <div className="p-4 border-t border-white/10 dark:border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Quick Filters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'No Annual Fee',
                'Travel Cards',
                'Cashback',
                'Premium',
                'First Timer',
                'High Income'
              ].map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleQuerySelect(`Best ${filter.toLowerCase()} credit cards`)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium",
                    "transition-all duration-200",
                    glassmorphism.button,
                    "border border-white/15 dark:border-white/8",
                    "hover:bg-white/10 dark:hover:bg-black/20",
                    "hover:scale-105"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tips */}
          {!query && (
            <div className={cn(
              "p-4 border-t border-white/10 dark:border-white/5",
              "bg-gradient-to-r from-blue-500/5 to-purple-500/5"
            )}>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">💡 Pro Tip:</p>
                  <p>Try natural language like "Show me travel cards under ₹5000 annual fee" or "Compare HDFC and Axis premium cards"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Examples */}
      {!isExpanded && !query && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[
            'Cards with lounge access',
            'Best for fuel cashback',
            'No joining fee cards',
            'Premium travel cards'
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(example);
                setIsExpanded(true);
                inputRef.current?.focus();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs",
                "transition-all duration-200",
                glassmorphism.button,
                "border border-white/10 dark:border-white/5",
                "hover:bg-white/10 dark:hover:bg-black/20",
                "text-muted-foreground hover:text-foreground",
                "hover:scale-105"
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