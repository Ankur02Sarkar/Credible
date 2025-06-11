"use client";

import { useCallback, useState } from "react";
import { cn, glassGradients, glassmorphism } from "~/lib/glassmorphism";
import type { AppliedFilter, FilterOptions } from "~/types/credit-card";
import { AppliedFilters } from "./AppliedFilters";
import { SelectFilter } from "./SelectFilter";

interface FilterContainerProps {
	filters: FilterOptions;
	onFiltersChangeAction: (filters: FilterOptions) => void;
	className?: string;
}

const SORT_OPTIONS = [
	{ value: "", label: "Featured" },
	{ value: "most-viewed", label: "Most Viewed" },
	{ value: "most-rated", label: "Most Rated" },
	{ value: "latest-credit-card", label: "Latest Credit Cards" },
	{ value: "joining-fee(low-high)", label: "Joining Fee (Low - High)" },
	{ value: "joining-fee(high-low)", label: "Joining Fee (High - Low)" },
];

const PRIVILEGE_OPTIONS = [
	{ value: "", label: "Choose a Privilege" },
	{ value: "Cash Withdrawal Benefit", label: "Cash Withdrawal Benefit" },
	{ value: "Cashback Benefit", label: "Cashback Benefit" },
	{ value: "Concierge Services", label: "Concierge Services" },
	{ value: "Dining Benefit", label: "Dining Benefit" },
	{ value: "EMI Benefit", label: "EMI Benefit" },
	{ value: "Entertainment Benefit", label: "Entertainment Benefit" },
	{ value: "Fuel Surcharge", label: "Fuel Surcharge" },
	{ value: "Insurance Benefit", label: "Insurance Benefit" },
	{ value: "Interest-Free Period", label: "Interest-Free Period" },
	{ value: "Lounge Access", label: "Lounge Access" },
	{ value: "Milestone Benefit", label: "Milestone Benefit" },
	{ value: "Other Benefit", label: "Other Benefit" },
	{ value: "Revolving Credit", label: "Revolving Credit" },
	{ value: "Reward Points", label: "Reward Points" },
	{ value: "Shopping Benefit", label: "Shopping Benefit" },
	{ value: "Travel Benefit", label: "Travel Benefit" },
	{ value: "Welcome Bonus", label: "Welcome Bonus" },
	{ value: "Zero Lost Card Liability", label: "Zero Lost Card Liability" },
];

const INCOME_OPTIONS = [
	{ value: "", label: "Choose Your Income" },
	{ value: "0-20000", label: "Up to ₹ 20k" },
	{ value: "20001-25000", label: "₹ 20k to 25k" },
	{ value: "25001-50000", label: "₹ 25k to 50k" },
	{ value: "50000-100000", label: "₹ 50k to 1l" },
	{ value: "100000-1000000", label: "Above ₹ 1l" },
];

const EMPLOYMENT_OPTIONS = [
	{ value: "", label: "Choose Your Employment" },
	{ value: "Salaried", label: "I'm Salaried" },
	{ value: "Self Employed", label: "I'm Self Employed" },
	{ value: "Student", label: "I'm Student" },
];

export function FilterContainer({
	filters,
	onFiltersChangeAction,
	className,
}: FilterContainerProps) {
	const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([]);

	const updateFilter = useCallback(
		(key: Exclude<keyof FilterOptions, "page">, value: string) => {
			const newFilters = { ...filters, [key]: value };
			onFiltersChangeAction(newFilters);

			// Update applied filters
			const newAppliedFilters = [...appliedFilters];
			const existingIndex = newAppliedFilters.findIndex((f) => f.type === key);

			if (value && value !== "") {
				let label = value;

				// Get proper label based on filter type
				switch (key) {
					case "sortby":
						label =
							SORT_OPTIONS.find((opt) => opt.value === value)?.label || value;
						break;
					case "privileges":
						label =
							PRIVILEGE_OPTIONS.find((opt) => opt.value === value)?.label ||
							value;
						break;
					case "emptype":
						label =
							EMPLOYMENT_OPTIONS.find((opt) => opt.value === value)?.label ||
							value;
						break;
					case "incomeRange":
						label =
							INCOME_OPTIONS.find((opt) => opt.value === value)?.label || value;
						break;
				}

				const newFilter: AppliedFilter = { type: key, value, label };

				if (existingIndex >= 0) {
					newAppliedFilters[existingIndex] = newFilter;
				} else {
					newAppliedFilters.push(newFilter);
				}
			} else {
				// Remove filter if value is empty
				if (existingIndex >= 0) {
					newAppliedFilters.splice(existingIndex, 1);
				}
			}

			setAppliedFilters(newAppliedFilters);
		},
		[filters, onFiltersChangeAction, appliedFilters],
	);

	const removeFilter = useCallback(
		(type: AppliedFilter["type"]) => {
			updateFilter(type, "");
		},
		[updateFilter],
	);

	const clearAllFilters = useCallback(() => {
		const clearedFilters: FilterOptions = {
			sortby: "",
			privileges: "",
			emptype: "",
			incomeRange: "",
			page: 0,
		};
		onFiltersChangeAction(clearedFilters);
		setAppliedFilters([]);
	}, [onFiltersChangeAction]);

	return (
		<div className={cn("space-y-6", className)}>
			{/* Filter Container */}
			<div
				className={cn(
					"rounded-2xl p-6",
					glassmorphism.container,
					glassGradients.card,
					"border border-white/10 shadow-2xl dark:border-white/5",
				)}
			>
				<div className="space-y-4">
					<h2 className="mb-4 font-semibold text-foreground text-lg">
						Filter Credit Cards
					</h2>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						{/* Sort By Filter */}
						<div className="space-y-2">
							<label className="font-medium text-foreground text-sm">
								Sort By
							</label>
							<SelectFilter
								options={SORT_OPTIONS}
								value={filters.sortby}
								onChangeAction={(value) => updateFilter("sortby", value)}
								placeholder="Featured"
							/>
						</div>

						{/* Privileges Filter */}
						<div className="space-y-2">
							<label className="font-medium text-foreground text-sm">
								Privileges
							</label>
							<SelectFilter
								options={PRIVILEGE_OPTIONS}
								value={filters.privileges}
								onChangeAction={(value) => updateFilter("privileges", value)}
								placeholder="Choose a Privilege"
							/>
						</div>

						{/* Income Filter */}
						<div className="space-y-2">
							<label className="font-medium text-foreground text-sm">
								Income Range
							</label>
							<SelectFilter
								options={INCOME_OPTIONS}
								value={filters.incomeRange}
								onChangeAction={(value) => updateFilter("incomeRange", value)}
								placeholder="Choose Your Income"
							/>
						</div>

						{/* Employment Filter */}
						<div className="space-y-2">
							<label className="font-medium text-foreground text-sm">
								Employment
							</label>
							<SelectFilter
								options={EMPLOYMENT_OPTIONS}
								value={filters.emptype}
								onChangeAction={(value) => updateFilter("emptype", value)}
								placeholder="Choose Your Employment"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Applied Filters */}
			<AppliedFilters
				filters={appliedFilters}
				onRemoveFilter={removeFilter}
				onClearAll={clearAllFilters}
			/>
		</div>
	);
}
