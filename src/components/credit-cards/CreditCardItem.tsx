"use client";

import Image from "next/image";
import { Star, Eye, Calendar, CreditCard as CreditCardIcon, Shield, Gift, Plane, Utensils, Car, ShoppingBag, Trophy, Zap } from "lucide-react";
import { RatingDisplay } from "~/components/ui/rating-stars";
import { cn, glassmorphism, glassGradients } from "~/lib/glassmorphism";
import type { CreditCard, CardFeature } from "~/types/credit-card";

interface CreditCardItemProps {
  card: CreditCard;
  features: CardFeature[];
  className?: string;
  onViewDetails?: (cardId: string) => void;
}

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Reward Points": Trophy,
  "Travel Benefit": Plane,
  "Dining Benefit": Utensils,
  "Fuel Surcharge": Car,
  "Shopping Benefit": ShoppingBag,
  "Lounge Access": Shield,
  "Welcome Bonus": Gift,
  "Insurance Benefit": Shield,
  "Entertainment Benefit": Zap,
  "Cashback Benefit": CreditCardIcon,
  "EMI Benefit": Calendar,
  "Other Benefit": Star,
  "Zero Lost Card Liability": Shield,
  "Milestone Benefit": Trophy,
  "Cash Withdrawal Benefit": CreditCardIcon,
  "Concierge Services": Shield,
  "Interest-Free Period": Calendar,
  "Revolving Credit": CreditCardIcon,
};

const BEST_FOR_COLORS: Record<string, string> = {
  "Lifestyle": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Travel": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Rewards": "bg-green-500/20 text-green-300 border-green-500/30",
  "Cashback": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Fuel": "bg-red-500/20 text-red-300 border-red-500/30",
  "Shopping": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Dining": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export function CreditCardItem({ 
  card, 
  features, 
  className,
  onViewDetails 
}: CreditCardItemProps) {
  const cardFeatures = features.filter(feature => feature.cardID === card.cardID);
  
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatStats = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const bestForColor = BEST_FOR_COLORS[card.bestFor] || "bg-gray-500/20 text-gray-300 border-gray-500/30";

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl",
      "transition-all duration-500 hover:scale-[1.02]",
      glassmorphism.card,
      glassmorphism.cardHover,
      glassGradients.card,
      "shadow-2xl hover:shadow-3xl",
      "border border-white/10 dark:border-white/5",
      className
    )}>
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 dark:from-white/3 dark:to-white/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card Header */}
      <div className="relative p-4 sm:p-6 border-b border-white/10 dark:border-white/5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Card Image */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "w-12 h-8 sm:w-16 sm:h-10 rounded-lg overflow-hidden",
              "ring-2 ring-white/20 dark:ring-white/10",
              "shadow-lg"
            )}>
              <Image
                src={card.cardImage ? `https://credible-api.com/${card.cardImage}` : '/placeholder-card.png'}
                alt={card.cardName}
                width={64}
                height={40}
                sizes="(max-width: 640px) 48px, 64px"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center rounded-lg">
                      <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
            {card.isFeatured === 1 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Card Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1 truncate">
              {card.cardName}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <RatingDisplay 
                rating={card.overAllRating} 
                reviews={card.statsCount}
                size="sm"
              />
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{formatStats(card.statsCount)} views</span>
              </div>
            </div>
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
              "max-w-fit",
              bestForColor
            )}>
              Best For: {card.bestFor}
            </div>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Financial Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className={cn(
            "p-2 sm:p-3 rounded-xl",
            glassmorphism.filter,
            "border border-white/10 dark:border-white/5"
          )}>
            <div className="text-xs text-muted-foreground mb-1">Reward Rate</div>
            <div className="font-semibold text-sm sm:text-base text-foreground">{card.rewardRate}</div>
          </div>
          <div className={cn(
            "p-2 sm:p-3 rounded-xl",
            glassmorphism.filter,
            "border border-white/10 dark:border-white/5"
          )}>
            <div className="text-xs text-muted-foreground mb-1">Joining Fee</div>
            <div className="font-semibold text-foreground text-xs sm:text-sm">
              {card.joiningFee.split('|')[0]?.trim() || card.joiningFee}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className={cn(
            "p-2 sm:p-3 rounded-xl",
            glassmorphism.filter,
            "border border-white/10 dark:border-white/5"
          )}>
            <div className="text-xs text-muted-foreground mb-1">Annual Fee</div>
            <div className="font-semibold text-foreground text-xs sm:text-sm">
              {card.annualFee.split('|')[0]?.trim() || card.annualFee}
            </div>
          </div>
          <div className={cn(
            "p-2 sm:p-3 rounded-xl",
            glassmorphism.filter,
            "border border-white/10 dark:border-white/5"
          )}>
            <div className="text-xs text-muted-foreground mb-1">APR</div>
            <div className="font-semibold text-foreground text-xs sm:text-sm">
              {card.annualPercentageRate.split('|')[1]?.trim() || card.annualPercentageRate}
            </div>
          </div>
        </div>

        {/* Features */}
        {cardFeatures.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Key Features</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {cardFeatures.slice(0, 6).map((feature, index) => {
                const IconComponent = FEATURE_ICONS[feature.heading] || Star;
                return (
                  <div
                    key={`${feature.cardID}-${feature.heading}-${index}`}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg",
                      "text-xs font-medium",
                      glassmorphism.button,
                      "border border-white/15 dark:border-white/8",
                      "transition-all duration-200 hover:scale-105"
                    )}
                  >
                    <IconComponent className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate">{feature.heading}</span>
                  </div>
                );
              })}
              {cardFeatures.length > 6 && (
                <div className={cn(
                  "flex items-center px-1.5 sm:px-2 py-1 rounded-lg",
                  "text-xs font-medium text-muted-foreground",
                  glassmorphism.button,
                  "border border-white/15 dark:border-white/8"
                )}>
                  +{cardFeatures.length - 6} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Type & Employment */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
          <span className="text-muted-foreground">
            {card.cardType} • {card.employmentType}
          </span>
          <span className="text-muted-foreground">
            Min Income: ₹{(card.minMonthlyIncome / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 sm:p-6 pt-0">
        <button
          onClick={() => onViewDetails?.(card.cardID)}
          className={cn(
            "w-full py-2.5 sm:py-3 px-4 rounded-xl font-medium text-sm sm:text-base",
            "transition-all duration-300",
            "bg-gradient-to-r from-blue-600 to-purple-600",
            "hover:from-blue-500 hover:to-purple-500",
            "text-white shadow-lg hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
            "transform hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          Full Details
        </button>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={cn(
          "w-2 h-2 rounded-full bg-green-500 animate-pulse"
        )} />
      </div>
    </div>
  );
}