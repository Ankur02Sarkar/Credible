"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, glassmorphism } from "~/lib/glassmorphism";

interface Option {
	value: string;
	label: string;
	dataOrder?: string;
}

interface SelectFilterProps {
	options: Option[];
	value: string;
	onChangeAction: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function SelectFilter({
	options,
	value,
	onChangeAction,
	placeholder = "Select an option",
	className,
	disabled = false,
}: SelectFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const selectedOption = options.find((option) => option.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSearchTerm("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleToggle = () => {
		if (disabled) return;
		setIsOpen(!isOpen);
		if (!isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	};

	const handleSelect = (optionValue: string) => {
		onChangeAction(optionValue);
		setIsOpen(false);
		setSearchTerm("");
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape") {
			setIsOpen(false);
			setSearchTerm("");
		} else if (event.key === "Enter" && filteredOptions.length > 0) {
			handleSelect(filteredOptions[0]?.value || "");
		}
	};

	return (
		<div className={cn("relative w-full", className)} ref={dropdownRef}>
			{/* Main Select Button */}
			<button
				type="button"
				onClick={handleToggle}
				disabled={disabled}
				className={cn(
					"w-full rounded-xl px-4 py-3 text-left transition-all duration-300",
					"flex items-center justify-between gap-2",
					"font-medium text-sm",
					glassmorphism.input,
					"hover:bg-white/10 dark:hover:bg-black/30",
					"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
					"disabled:cursor-not-allowed disabled:opacity-50",
					isOpen && "ring-2 ring-blue-500/50",
				)}
			>
				<span
					className={cn(
						"truncate",
						selectedOption ? "text-foreground" : "text-muted-foreground",
					)}
				>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					className={cn(
						"h-4 w-4 text-muted-foreground transition-transform duration-200",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div
					className={cn(
						"absolute top-full right-0 left-0 z-50 mt-2",
						"overflow-hidden rounded-xl shadow-2xl",
						"border border-white/10 dark:border-white/5",
						glassmorphism.dropdown,
						"fade-in-0 zoom-in-95 animate-in duration-200",
					)}
				>
					{/* Search Input */}
					<div className="border-white/10 border-b p-2 dark:border-white/5">
						<input
							ref={inputRef}
							type="text"
							placeholder="Search options..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyDown={handleKeyDown}
							className={cn(
								"w-full rounded-lg px-3 py-2 text-sm",
								"bg-white/20 dark:bg-black/20",
								"border border-white/20 dark:border-white/10",
								"placeholder:text-muted-foreground",
								"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
								"transition-all duration-200",
							)}
						/>
					</div>

					{/* Options List */}
					<div className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-60 overflow-y-auto">
						{filteredOptions.length === 0 ? (
							<div className="px-4 py-3 text-center text-muted-foreground text-sm">
								No options found
							</div>
						) : (
							filteredOptions.map((option) => (
								<button
									key={option.value}
									onClick={() => handleSelect(option.value)}
									className={cn(
										"w-full px-4 py-3 text-left text-sm",
										"hover:bg-white/10 dark:hover:bg-black/20",
										"transition-all duration-150",
										"flex items-center justify-between gap-2",
										"focus:bg-white/10 focus:outline-none dark:focus:bg-black/20",
										value === option.value &&
											"bg-blue-500/20 text-blue-300 dark:text-blue-400",
									)}
								>
									<span className="truncate">{option.label}</span>
									{value === option.value && (
										<Check className="h-4 w-4 text-blue-500" />
									)}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
