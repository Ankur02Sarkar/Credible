import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AXISLogo from "~/assets/banks/axis.png";
import BOBLogo from "~/assets/banks/bob.png";
import IDFCLogo from "~/assets/banks/idfc.png";
import SBILogo from "~/assets/banks/sbi.png";
import { AnimatedGroup } from "~/components/ui/animated-group";
import { Button } from "~/components/ui/button";
import { TextEffect } from "~/components/ui/text-effect";

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
};

export default function HeroSection() {
	return (
		<>
			<main className="overflow-hidden">
				<div
					aria-hidden
					className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
				>
					<div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
					<div className="-rotate-45 absolute top-0 left-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
					<div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-60 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
				</div>
				<section>
					<div className="relative pt-24 md:pt-36">
						<AnimatedGroup
							variants={{
								container: {
									visible: {
										transition: {
											delayChildren: 1,
										},
									},
								},
								item: {
									hidden: {
										opacity: 0,
										y: 20,
									},
									visible: {
										opacity: 1,
										y: 0,
										transition: {
											type: "spring",
											bounce: 0.3,
											duration: 2,
										},
									},
								},
							}}
							className="-z-20 absolute inset-0"
						>
							<Image
								src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
								alt="background"
								className="-z-20 absolute inset-x-0 top-56 hidden lg:top-32 dark:block"
								width="3276"
								height="4095"
							/>
						</AnimatedGroup>
						<div className="-z-10 absolute inset-0 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
						<div className="mx-auto max-w-7xl px-6">
							<div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
								<AnimatedGroup variants={transitionVariants}>
									<Link
										href="/home"
										className="group mx-auto flex w-fit items-center gap-4 rounded-full border bg-muted p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 hover:bg-background dark:border-t-white/5 dark:shadow-zinc-950 dark:hover:border-t-border"
									>
										<span className="text-foreground text-sm">
											Introducing Semantic Search for Credit Cards
										</span>
										<span className="block h-4 w-0.5 border-l bg-white dark:border-background dark:bg-zinc-700"></span>

										<div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
											<div className="-translate-x-1/2 flex w-12 duration-500 ease-in-out group-hover:translate-x-0">
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
											</div>
										</div>
									</Link>
								</AnimatedGroup>

								<TextEffect
									preset="fade-in-blur"
									speedSegment={0.3}
									as="h1"
									className="mt-8 text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]"
								>
									AI-Powered Credit Card Comparison
								</TextEffect>
								<TextEffect
									per="line"
									preset="fade-in-blur"
									speedSegment={0.3}
									delay={0.5}
									as="p"
									className="mx-auto mt-8 max-w-2xl text-balance text-lg"
								>
									Find the perfect credit card that matches your lifestyle and
									financial needs with our AI-powered comparison and
									recommendation engine.
								</TextEffect>

								<AnimatedGroup
									variants={{
										container: {
											visible: {
												transition: {
													staggerChildren: 0.05,
													delayChildren: 0.75,
												},
											},
										},
										...transitionVariants,
									}}
									className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
								>
									<div
										key={1}
										className="rounded-[calc(var(--radius-xl)+0.125rem)] border bg-foreground/10 p-0.5"
									>
										<Button
											asChild
											size="lg"
											className="rounded-xl px-5 text-base"
										>
											<Link href="/home">
												<span className="text-nowrap">Compare Cards</span>
											</Link>
										</Button>
									</div>
								</AnimatedGroup>
							</div>
						</div>

						<AnimatedGroup
							variants={{
								container: {
									visible: {
										transition: {
											staggerChildren: 0.05,
											delayChildren: 0.75,
										},
									},
								},
								...transitionVariants,
							}}
						>
							<div className="-mr-56 relative mt-8 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
								<div
									aria-hidden
									className="absolute inset-0 z-10 bg-linear-to-b from-35% from-transparent to-background"
								/>
								<div className="relative inset-shadow-2xs mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background dark:inset-shadow-white/20">
									<Image
										className="relative hidden aspect-15/8 rounded-2xl bg-background dark:block"
										src="/dark-logo.jpeg"
										alt="app screen"
										width="2700"
										height="1440"
									/>
									<Image
										className="relative z-2 aspect-15/8 rounded-2xl border border-border/25 dark:hidden"
										src="/logo-light.jpg"
										alt="app screen"
										width="2700"
										height="1440"
									/>
								</div>
							</div>
						</AnimatedGroup>
					</div>
				</section>
				<section className="bg-background pt-16 pb-16 md:pb-32">
					<div className="group relative m-auto max-w-5xl px-6">
						<div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
							<Link
								href="/"
								className="block text-sm duration-150 hover:opacity-75"
							>
								<span>Explore All Credit Cards</span>

								<ChevronRight className="ml-1 inline-block size-3" />
							</Link>
						</div>
						<div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14">
							<div className="flex">
								<Image
									className="mx-auto w-fit"
									src={SBILogo}
									alt="SBI Logo"
									height="40"
									width="40"
								/>
							</div>
							<div className="flex">
								<Image
									className="mx-auto w-fit"
									src={BOBLogo}
									alt="BOB Logo"
									height="40"
									width="40"
								/>
							</div>
							<div className="flex">
								<Image
									className="mx-auto w-fit"
									src={IDFCLogo}
									alt="IDFC Logo"
									height="40"
									width="40"
								/>
							</div>
							<div className="flex">
								<Image
									className="mx-auto w-fit"
									src={AXISLogo}
									alt="AXIS Logo"
									height="40"
									width="40"
								/>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	);
}
