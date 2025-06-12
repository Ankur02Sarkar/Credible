"use client";

import { Combobox } from "~/components/ui/combobox";

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
	return (
		<Combobox
			options={options}
			value={value}
			onChangeAction={onChangeAction}
			placeholder={placeholder}
			searchPlaceholder="Search options..."
			emptyMessage="No options found"
			className={className}
			disabled={disabled}
		/>
	);
}
