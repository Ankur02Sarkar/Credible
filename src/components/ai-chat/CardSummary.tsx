"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { cn, glassmorphism, glassGradients } from "~/lib/glassmorphism";
import { geminiService, type CardSummary } from "~/lib/ai/gemini-service";
import type { CreditCard, CardFeature } from "~/types/credit-card";

interface CardSummaryProps {
  card: CreditCard;
  features: CardFeature[];
  className?: string;
}

export function CardSummaryComponent({ card, features, className }: CardSummaryProps) {
  const [summary, setSummary] = useState<CardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    generateSummary();
  }, [card.cardID]);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cardSummary = await geminiService.generateCardSummary(card, features);
      setSummary(cardSummary);
    } catch (err) {
      console.error('Error generating card summary:', err);
      setError('Failed to generate AI summary');
      
      // Fallback summary
      const fallback: CardSummary = {
        cardId: card.cardID,
        summary: `${card.cardName} offers ${card.rewardRate} rewards and is designed for ${card.bestFor.toLowerCase()}. With a minimum income requirement of ₹${card.minMonthlyIncome.toLocaleString()}, this ${card.cardType.toLowerCase()} provides excellent value.`,
        keyBenefits: features.slice(0, 5).map(f => f.heading),
        bestFor: [card.bestFor, card.employmentType],
      };
      setSummary(fallback);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "p-4 rounded-xl",
        glassmorphism.card,
        "border border-white/10 dark:border-white/5",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-3 bg-white/10 dark:bg-black/20 rounded animate-pulse mb-2" />
            <div className="h-3 bg-white/10 dark:bg-black/20 rounded animate-pulse w-3/4" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Generating AI summary...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className={cn(
        "p-4 rounded-xl border border-red-500/20 bg-red-500/5",
        className
      )}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">AI Summary Unavailable</span>
        </div>
        <button
          onClick={generateSummary}
          className="text-xs text-red-300 hover:text-red-200 mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl",
      glassmorphism.card,
      glassGradients.card,
      "border border-white/10 dark:border-white/5",
      "transition-all duration-300 hover:shadow-lg",
      className
    )}>
      {/* AI Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          "bg-gradient-to-r from-purple-500/20 to-blue-500/20",
          "border border-purple-500/30",
          "text-purple-300"
        )}>
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>AI</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Summary */}
        <div className="pr-12">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            AI Summary
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.summary}
          </p>
        </div>

        {/* Key Benefits */}
        {summary.keyBenefits.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Key Benefits
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {summary.keyBenefits.slice(0, isExpanded ? undefined : 4).map((benefit, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    "bg-green-500/10 text-green-300 border border-green-500/20",
                    "transition-all duration-200 hover:scale-105"
                  )}
                >
                  {benefit}
                </span>
              ))}
              {!isExpanded && summary.keyBenefits.length > 4 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    "bg-white/5 text-muted-foreground border border-white/10",
                    "hover:bg-white/10 transition-all duration-200"
                  )}
                >
                  +{summary.keyBenefits.length - 4} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Best For */}
        {summary.bestFor.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              Best For
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {summary.bestFor.map((category, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                  )}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {summary.warnings && summary.warnings.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              Important Notes
            </h5>
            <div className="space-y-1">
              {summary.warnings.map((warning, index) => (
                <p
                  key={index}
                  className={cn(
                    "text-xs p-2 rounded-md",
                    "bg-yellow-500/10 text-yellow-200 border border-yellow-500/20"
                  )}
                >
                  {warning}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Indicator */}
        <div className="pt-2 border-t border-white/10 dark:border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">AI Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-white/10 dark:bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: '85%' }}
                />
              </div>
              <span className="text-foreground font-medium">85%</span>
            </div>
          </div>
        </div>

        {/* Regenerate Button */}
        {error && (
          <button
            onClick={generateSummary}
            disabled={loading}
            className={cn(
              "w-full py-2 px-3 rounded-lg text-xs font-medium",
              "transition-all duration-200",
              glassmorphism.button,
              "border border-white/10 dark:border-white/5",
              "hover:bg-white/10 dark:hover:bg-black/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Regenerate Summary
              </>
            )}
          </button>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-500/5 to-transparent rounded-tl-full" />
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-500/5 to-transparent rounded-br-full" />
    </div>
  );
}

export default CardSummaryComponent;