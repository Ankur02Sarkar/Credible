"use client";

import { X } from "lucide-react";
import { cn, glassmorphism } from "~/lib/glassmorphism";
import type { AppliedFilter } from "~/types/credit-card";

interface AppliedFiltersProps {
	filters: AppliedFilter[];
	onRemoveFilter: (type: AppliedFilter["type"]) => void;
	onClearAll: () => void;
	className?: string;
}

export function AppliedFilters({
	filters,
	onRemoveFilter,
	onClearAll,
	className,
}: AppliedFiltersProps) {
	if (filters.length === 0) {
		return null;
	}

	return (
		<div className={cn("space-y-3", className)}>
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-foreground text-sm">Applied Filters</h3>
				<button
					onClick={onClearAll}
					className={cn(
						"rounded-lg px-3 py-1.5 font-medium text-xs",
						"text-red-400 hover:text-red-300",
						"transition-all duration-200",
						glassmorphism.button,
						"border-red-500/20 hover:bg-red-500/10",
					)}
				>
					Clear All
				</button>
			</div>

			<div className="flex flex-wrap gap-2">
				{filters.map((filter) => (
					<div
						key={filter.type}
						className={cn(
							"flex items-center gap-2 rounded-lg px-3 py-2",
							"font-medium text-sm",
							glassmorphism.card,
							"group hover:bg-white/15 dark:hover:bg-black/25",
							"transition-all duration-200",
							"fade-in-0 zoom-in-95 animate-in duration-300",
						)}
					>
						<span className="max-w-32 truncate text-foreground">
							{filter.label}
						</span>
						<button
							onClick={() => onRemoveFilter(filter.type)}
							className={cn(
								"rounded-full p-1",
								"text-muted-foreground hover:text-foreground",
								"hover:bg-white/20 dark:hover:bg-black/30",
								"transition-all duration-150",
								"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
							)}
							aria-label={`Remove ${filter.label} filter`}
						>
							<X className="h-3 w-3" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
