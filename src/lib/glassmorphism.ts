import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Glassmorphism utility classes
export const glassmorphism = {
	// Base glass effect
	base: "backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10",

	// Glass card variations
	card: "backdrop-blur-lg bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 shadow-2xl",
	cardHover:
		"hover:bg-white/10 dark:hover:bg-black/30 hover:border-white/20 dark:hover:border-white/10 transition-all duration-300",

	// Glass containers
	container:
		"backdrop-blur-xl bg-white/5 dark:bg-black/10 border border-white/10 dark:border-white/5",

	// Glass overlays
	overlay: "backdrop-blur-sm bg-black/20 dark:bg-black/40",

	// Glass buttons
	button:
		"backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30",

	// Glass inputs
	input:
		"backdrop-blur-md bg-white/5 dark:bg-black/20 border border-white/20 dark:border-white/10 focus:border-white/40 dark:focus:border-white/20",

	// Glass navigation
	nav: "backdrop-blur-xl bg-white/10 dark:bg-black/20 border-b border-white/10 dark:border-white/5",

	// Glass modals
	modal:
		"backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl",

	// Glass dropdowns
	dropdown:
		"backdrop-blur-lg bg-white/90 dark:bg-black/80 border border-white/20 dark:border-white/10 shadow-xl",

	// Glass filters
	filter:
		"backdrop-blur-md bg-white/8 dark:bg-black/25 border border-white/15 dark:border-white/8",
};

// Gradient backgrounds for glassmorphism
export const glassGradients = {
	primary:
		"bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20",
	secondary:
		"bg-gradient-to-br from-cyan-500/15 via-teal-500/15 to-green-500/15",
	accent: "bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20",
	neutral: "bg-gradient-to-br from-gray-500/10 via-slate-500/10 to-zinc-500/10",
	card: "bg-gradient-to-br from-white/5 via-transparent to-black/5 dark:from-white/3 dark:via-transparent dark:to-white/3",
};

// Animation classes for glass elements
export const glassAnimations = {
	float: "animate-[float_6s_ease-in-out_infinite]",
	glow: "animate-[glow_2s_ease-in-out_infinite_alternate]",
	shimmer: "animate-[shimmer_2s_linear_infinite]",
	pulse: "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
};

// Custom keyframes to add to your CSS
export const glassKeyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  from { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
  to { box-shadow: 0 0 30px rgba(255, 255, 255, 0.2); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Utility function to create custom glass styles
export function createGlassStyle(opacity = 0.1, blur = 12) {
	return `backdrop-blur-[${blur}px] bg-white/${opacity * 100} dark:bg-black/${opacity * 100} border border-white/${opacity * 2 * 100} dark:border-white/${opacity * 100}`;
}

// Utility function for responsive glass effects
export const responsiveGlass = {
	mobile: "backdrop-blur-sm bg-white/20 dark:bg-black/30",
	tablet: "backdrop-blur-md bg-white/15 dark:bg-black/25",
	desktop: "backdrop-blur-lg bg-white/10 dark:bg-black/20",
};
