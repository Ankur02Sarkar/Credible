"use client";

import { Star } from "lucide-react";
import { cn } from "~/lib/glassmorphism";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = true,
  className,
  readonly = true,
  onRatingChange,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const handleStarClick = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <button
            key={`full-${index}`}
            type="button"
            onClick={() => handleStarClick(index)}
            disabled={readonly}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "fill-yellow-400 text-yellow-400",
                "drop-shadow-sm"
              )}
            />
          </button>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <button
            type="button"
            onClick={() => handleStarClick(fullStars)}
            disabled={readonly}
            className={cn(
              "relative transition-all duration-200",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "text-gray-300 dark:text-gray-600"
              )}
            />
            <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-yellow-400 text-yellow-400",
                  "drop-shadow-sm"
                )}
              />
            </div>
          </button>
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + index)}
            disabled={readonly}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-110 hover:text-yellow-400 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "text-gray-300 dark:text-gray-600",
                !readonly && "hover:text-yellow-400"
              )}
            />
          </button>
        ))}
      </div>

      {/* Rating Number */}
      {showNumber && (
        <span className="text-sm font-medium text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  reviews?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingDisplay({
  rating,
  reviews,
  size = "md",
  className,
}: RatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RatingStars rating={rating} size={size} showNumber={false} />
      <div className="flex items-center gap-1 text-sm">
        <span className="font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
        {reviews && (
          <span className="text-muted-foreground">
            ({reviews.toLocaleString()})
          </span>
        )}
      </div>
    </div>
  );
}

interface InteractiveRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export function InteractiveRating({
  rating,
  onRatingChange,
  size = "md",
  className,
  disabled = false,
}: InteractiveRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <RatingStars
        rating={rating}
        size={size}
        showNumber={true}
        readonly={disabled}
        onRatingChange={onRatingChange}
      />
    </div>
  );
}