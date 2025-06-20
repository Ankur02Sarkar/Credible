import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { HeroHeader } from "~/components/header";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
	title: "Credible",
	description: "AI Credit Comparison Web App",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<HeroHeader />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
