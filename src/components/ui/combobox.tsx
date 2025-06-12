"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { glassmorphism } from "~/lib/glassmorphism";
import { cn } from "~/lib/utils";

interface Option {
	value: string;
	label: string;
	dataOrder?: string;
}

interface ComboboxProps {
	options: Option[];
	value: string;
	onChangeAction: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	disabled?: boolean;
}

export function Combobox({
	options,
	value,
	onChangeAction,
	placeholder = "Select an option",
	searchPlaceholder = "Search options...",
	emptyMessage = "No options found.",
	className,
	disabled = false,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);

	const selectedOption = options.find((option) => option.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"w-full justify-between",
						"rounded-xl px-4 py-3",
						"font-medium text-sm",
						glassmorphism.input,
						"hover:bg-white/10 dark:hover:bg-black/30",
						"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
						"disabled:cursor-not-allowed disabled:opacity-50",
						open && "ring-2 ring-blue-500/50",
						className,
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
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={cn(
					"w-full min-w-[var(--radix-popover-trigger-width)] p-0",
					glassmorphism.dropdown,
					"border border-white/10 dark:border-white/5",
				)}
			>
				<Command>
					<CommandInput
						placeholder={searchPlaceholder}
						className={cn(
							"border-white/10 border-b dark:border-white/5",
							"bg-white/20 dark:bg-black/20",
							"placeholder:text-muted-foreground",
							"focus:outline-none focus:ring-2 focus:ring-blue-500/50",
							"transition-all duration-200",
						)}
					/>
					<CommandEmpty className="py-3 text-center text-muted-foreground text-sm">
						{emptyMessage}
					</CommandEmpty>
					<CommandGroup className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-60 overflow-y-auto">
						{options.map((option) => (
							<CommandItem
								key={option.value}
								value={option.value}
								onSelect={() => {
									onChangeAction(option.value);
									setOpen(false);
								}}
								className={cn(
									"px-4 py-3 text-sm",
									"hover:bg-white/10 dark:hover:bg-black/20",
									"transition-all duration-150",
									"focus:bg-white/10 dark:focus:bg-black/20",
									value === option.value &&
										"bg-blue-500/20 text-blue-300 dark:text-blue-400",
								)}
							>
								<span className="truncate">{option.label}</span>
								{value === option.value && (
									<Check className="ml-auto h-4 w-4 text-blue-500" />
								)}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
