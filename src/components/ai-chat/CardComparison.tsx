"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, TrendingUp, TrendingDown, CheckCircle, XCircle, Info, Zap, ArrowRight, Scale } from "lucide-react";
import { cn, glassmorphism, glassGradients } from "~/lib/glassmorphism";
import { geminiService, type ComparisonResult } from "~/lib/ai/gemini-service";
import { RatingDisplay } from "~/components/ui/rating-stars";
import type { CreditCard, CardFeature } from "~/types/credit-card";

interface CardComparisonProps {
  cards: CreditCard[];
  features: CardFeature[];
  onClose?: () => void;
  className?: string;
}

export function CardComparison({ cards, features, onClose, className }: CardComparisonProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'pros-cons' | 'details'>('overview');

  useEffect(() => {
    if (cards.length >= 2) {
      generateComparison();
    }
  }, [cards]);

  const generateComparison = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geminiService.compareCards(cards, features);
      setComparison(result);
    } catch (err) {
      console.error('Error generating comparison:', err);
      setError('Failed to generate AI comparison');
      
      // Fallback comparison
      const fallback: ComparisonResult = {
        cards,
        comparison: {
          pros: cards.reduce((acc, card) => {
            acc[card.cardName] = [
              `${card.rewardRate} reward rate`,
              `Rated ${card.overAllRating}/5 by users`,
              `Best for ${card.bestFor.toLowerCase()}`
            ];
            return acc;
          }, {} as Record<string, string[]>),
          cons: cards.reduce((acc, card) => {
            acc[card.cardName] = [
              `${card.joiningFee.split('|')[0]?.trim()} joining fee`,
              `₹${card.minMonthlyIncome.toLocaleString()} minimum income required`
            ];
            return acc;
          }, {} as Record<string, string[]>),
          bestFor: cards.reduce((acc, card) => {
            acc[card.cardName] = card.bestFor;
            return acc;
          }, {} as Record<string, string>),
          recommendation: 'Choose based on your spending patterns, income level, and preferred benefits.'
        }
      };
      setComparison(fallback);
    } finally {
      setLoading(false);
    }
  };

  if (cards.length < 2) {
    return (
      <div className={cn(
        "p-8 text-center rounded-xl",
        glassmorphism.card,
        "border border-white/10 dark:border-white/5",
        className
      )}>
        <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Card Comparison</h3>
        <p className="text-sm text-muted-foreground">Select at least 2 cards to compare them side by side.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn(
        "p-8 text-center rounded-xl",
        glassmorphism.card,
        glassGradients.card,
        "border border-white/10 dark:border-white/5",
        className
      )}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Cards</h3>
        <p className="text-sm text-muted-foreground">Our AI is comparing {cards.length} cards to provide detailed insights...</p>
        <div className="mt-4 max-w-sm mx-auto">
          <div className="h-2 bg-white/10 dark:bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !comparison) {
    return (
      <div className={cn(
        "p-8 text-center rounded-xl border border-red-500/20 bg-red-500/5",
        className
      )}>
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-300 mb-2">Comparison Failed</h3>
        <p className="text-sm text-red-200 mb-4">Unable to generate AI comparison at the moment.</p>
        <button
          onClick={generateComparison}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "bg-red-600 hover:bg-red-500 text-white",
            "transition-all duration-200"
          )}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!comparison) return null;

  const { cards: comparedCards, comparison: comparisonData } = comparison;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl",
      glassmorphism.modal,
      glassGradients.card,
      "border border-white/10 dark:border-white/5",
      "shadow-2xl",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "p-6 border-b border-white/10 dark:border-white/5",
        glassmorphism.nav
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "bg-gradient-to-r from-purple-500/20 to-blue-500/20",
              "border border-purple-500/30"
            )}>
              <Scale className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Card Comparison</h2>
              <p className="text-sm text-muted-foreground">
                Comparing {comparedCards.length} credit cards
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-white/10 dark:hover:bg-black/20",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'pros-cons', label: 'Pros & Cons', icon: Scale },
            { id: 'details', label: 'Details', icon: Zap }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                "transition-all duration-200",
                selectedTab === id
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto scrollbar-thin">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Recommendation */}
            <div className={cn(
              "p-4 rounded-xl",
              "bg-gradient-to-r from-purple-500/10 to-blue-500/10",
              "border border-purple-500/20"
            )}>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">AI Recommendation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {comparisonData.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Cards Overview */}
            <div className="grid gap-4">
              {comparedCards.map((card, index) => (
                <div
                  key={card.cardID}
                  className={cn(
                    "p-4 rounded-xl",
                    glassmorphism.card,
                    "border border-white/10 dark:border-white/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{card.cardName}</h4>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      index === 0 
                        ? "bg-gold-500/20 text-gold-300 border border-gold-500/30"
                        : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                    )}>
                      {comparisonData.bestFor[card.cardName] || card.bestFor}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Rating: </span>
                      <RatingDisplay rating={card.overAllRating} size="sm" />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reward Rate: </span>
                      <span className="text-foreground font-medium">{card.rewardRate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joining Fee: </span>
                      <span className="text-foreground">{card.joiningFee.split('|')[0]?.trim()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min Income: </span>
                      <span className="text-foreground">₹{card.minMonthlyIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'pros-cons' && (
          <div className="space-y-6">
            {comparedCards.map((card) => (
              <div
                key={card.cardID}
                className={cn(
                  "p-4 rounded-xl",
                  glassmorphism.card,
                  "border border-white/10 dark:border-white/5"
                )}
              >
                <h4 className="font-semibold text-foreground mb-4">{card.cardName}</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Pros */}
                  <div>
                    <h5 className="text-sm font-medium text-green-300 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Advantages
                    </h5>
                    <div className="space-y-2">
                      {(comparisonData.pros[card.cardName] || []).map((pro, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cons */}
                  <div>
                    <h5 className="text-sm font-medium text-red-300 mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Considerations
                    </h5>
                    <div className="space-y-2">
                      {(comparisonData.cons[card.cardName] || []).map((con, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'details' && (
          <div className="space-y-6">
            {/* Feature Comparison */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 dark:border-white/5">
                      <th className="text-left p-2 text-muted-foreground">Feature</th>
                      {comparedCards.map(card => (
                        <th key={card.cardID} className="text-left p-2 text-foreground">
                          {card.cardName.split(' ').slice(0, 2).join(' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Card Type', key: 'cardType' },
                      { label: 'Joining Fee', key: 'joiningFee' },
                      { label: 'Annual Fee', key: 'annualFee' },
                      { label: 'Reward Rate', key: 'rewardRate' },
                      { label: 'Min Income', key: 'minMonthlyIncome', format: (value: number) => `₹${value.toLocaleString()}` },
                      { label: 'Rating', key: 'overAllRating', format: (value: number) => `${value}/5` }
                    ].map(({ label, key, format }) => (
                      <tr key={key} className="border-b border-white/5">
                        <td className="p-2 text-muted-foreground font-medium">{label}</td>
                        {comparedCards.map(card => (
                          <td key={card.cardID} className="p-2 text-foreground">
                            {format 
                              ? format(card[key as keyof CreditCard] as any)
                              : (card[key as keyof CreditCard] as string)?.split('|')[0]?.trim() || card[key as keyof CreditCard]
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Lists */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Available Features</h3>
              <div className="grid gap-4">
                {comparedCards.map(card => {
                  const cardFeatures = features.filter(f => f.cardID === card.cardID);
                  return (
                    <div
                      key={card.cardID}
                      className={cn(
                        "p-4 rounded-xl",
                        glassmorphism.card,
                        "border border-white/10 dark:border-white/5"
                      )}
                    >
                      <h4 className="font-medium text-foreground mb-3">{card.cardName}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cardFeatures.map((feature, index) => (
                          <span
                            key={index}
                            className={cn(
                              "px-2 py-1 rounded-md text-xs font-medium",
                              "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            )}
                          >
                            {feature.heading}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-white/10 dark:border-white/5",
        "bg-gradient-to-r from-white/5 to-transparent"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Analysis powered by AI</span>
          </div>
          
          <button
            onClick={generateComparison}
            disabled={loading}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium",
              "transition-all duration-200",
              glassmorphism.button,
              "border border-white/10 dark:border-white/5",
              "hover:bg-white/10 dark:hover:bg-black/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <ArrowRight className="w-3 h-3" />
                Refresh Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/5 to-transparent rounded-tl-full" />
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-br-full" />
    </div>
  );
}

export default CardComparison;