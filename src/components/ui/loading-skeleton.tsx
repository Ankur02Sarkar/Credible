"use client";

import { cn } from "~/lib/glassmorphism";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-white/10 dark:bg-black/20",
				className,
			)}
			{...props}
		/>
	);
}

export function CardSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-white/10 p-6 dark:border-white/5",
				"bg-white/5 backdrop-blur-md dark:bg-black/20",
				className,
			)}
		>
			{/* Header */}
			<div className="mb-6 flex items-start gap-4">
				<Skeleton className="h-10 w-16 rounded-lg" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-6 w-3/4" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-5 w-32 rounded-full" />
				</div>
			</div>

			{/* Details Grid */}
			<div className="mb-4 grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-5 w-20" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-3 w-20" />
					<Skeleton className="h-5 w-24" />
				</div>
			</div>

			<div className="mb-6 grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Skeleton className="h-3 w-18" />
					<Skeleton className="h-5 w-22" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-3 w-12" />
					<Skeleton className="h-5 w-16" />
				</div>
			</div>

			{/* Features */}
			<div className="mb-6 space-y-3">
				<Skeleton className="h-4 w-24" />
				<div className="flex flex-wrap gap-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-6 w-20 rounded-lg" />
					))}
				</div>
			</div>

			{/* Button */}
			<Skeleton className="h-12 w-full rounded-xl" />
		</div>
	);
}

export function FilterSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-white/10 p-6 dark:border-white/5",
				"bg-white/5 backdrop-blur-md dark:bg-black/10",
				className,
			)}
		>
			<Skeleton className="mb-4 h-6 w-40" />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-12 w-full rounded-xl" />
					</div>
				))}
			</div>
		</div>
	);
}

export function LoadingGrid({
	count = 6,
	className,
}: { count?: number; className?: string }) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
				className,
			)}
		>
			{Array.from({ length: count }).map((_, i) => (
				<CardSkeleton key={i} />
			))}
		</div>
	);
}
