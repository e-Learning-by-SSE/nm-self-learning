import { useEffect, useRef, useState } from "react";
import { TransparentDialog } from "../dialog/dialog";

type AnimationMode = "static" | "continuous" | "once";

interface LightningBoltProps {
	animationMode?: AnimationMode;
	className?: string;
	onAnimationComplete?: () => void;
}

export function LightningBolt({
	animationMode = "static",
	className = "",
	onAnimationComplete
}: LightningBoltProps): JSX.Element {
	const [isAnimating, setIsAnimating] = useState(false);
	const [isCollapsing, setIsCollapsing] = useState(false);
	const [hasAnimated, setHasAnimated] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(
		function handleAnimation() {
			// Clear any existing timeouts
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			if (animationMode === "static") {
				setIsAnimating(false);
				setIsCollapsing(false);
				setHasAnimated(false);
				return;
			}

			if (animationMode === "once") {
				// Play animation once and stay visible
				setIsCollapsing(false);
				setIsAnimating(true);
				setHasAnimated(true);
				timeoutRef.current = setTimeout(() => {
					// Don't set isAnimating to false - keep it expanded
					// setIsAnimating(false); // Removed this line
					if (onAnimationComplete) {
						onAnimationComplete();
					}
				}, 2600);
				return;
			}

			if (animationMode === "continuous") {
				// Continuous loop: collapse → expand → collapse → expand
				const startCycle = () => {
					setIsCollapsing(false);
					setIsAnimating(true);
					setHasAnimated(true);

					timeoutRef.current = setTimeout(() => {
						// Start collapsing animation
						setIsAnimating(false);
						setIsCollapsing(true);

						timeoutRef.current = setTimeout(() => {
							setIsCollapsing(false);
							timeoutRef.current = setTimeout(startCycle, 200);
						}, 800); // Collapse animation duration
					}, 2600);
				};

				startCycle();
			}

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		},
		[animationMode, onAnimationComplete]
	);

	return (
		<div className={`lightning-bolt-container ${className}`}>
			<div
				className={`bolt ${isAnimating ? "animate" : ""} ${isCollapsing ? "collapse" : ""}`}
				data-mode={animationMode}
			>
				<svg viewBox="0 0 170 57" className="white left">
					<path d="M36.2701759,17.9733192 C-0.981139498,45.4810755 -7.86361824,57.6618438 15.6227397,54.5156241 C50.8522766,49.7962945 201.109341,31.1461782 161.361488,2"></path>
				</svg>
				<svg viewBox="0 0 170 57" className="white right">
					<path d="M36.2701759,17.9733192 C-0.981139498,45.4810755 -7.86361824,57.6618438 15.6227397,54.5156241 C50.8522766,49.7962945 201.109341,31.1461782 161.361488,2"></path>
				</svg>

				<div className="bolt-body">
					<span className="bolt-shape"></span>
				</div>

				<svg viewBox="0 0 112 44" className="circle">
					<path d="M96.9355003,2 C109.46067,13.4022454 131.614152,42 56.9906735,42 C-17.6328048,42 1.51790702,13.5493875 13.0513641,2"></path>
				</svg>

				<svg viewBox="0 0 70 3" className="line left">
					<path transform="translate(-2.000000, 0.000000)" d="M2,1.5 L70,1.5"></path>
				</svg>
				<svg viewBox="0 0 70 3" className="line right">
					<path transform="translate(-2.000000, 0.000000)" d="M2,1.5 L70,1.5"></path>
				</svg>
			</div>

			<style jsx>{`
				.lightning-bolt-container {
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.bolt {
					--bolt: rgb(242, 222, 16);
					width: 126px;
					height: 186px;
					position: relative;
				}

				.bolt svg {
					position: absolute;
					display: block;
					stroke-width: 4;
					fill: none;
					stroke-linecap: round;
					stroke: var(--bolt);
				}

				/* Static state: fully expanded bolt, no sparks */
				.bolt svg.circle {
					left: 7px;
					top: 100%;
					width: 112px;
					height: 44px;
					stroke-dashoffset: 179px;
					stroke-dasharray: 0px 178px; /* Hidden by default (static) */
				}

				.bolt svg.line {
					--r: 0deg;
					top: 95%;
					width: 70px;
					height: 3px;
					stroke-dashoffset: 71px;
					stroke-dasharray: 0px 70px; /* Hidden by default (static) */
					transform: rotate(var(--r));
				}

				.bolt svg.line.left {
					--r: 130deg;
					left: -24px;
				}

				.bolt svg.line.right {
					--r: 40deg;
					right: -24px;
				}

				.bolt svg.white {
					--r: 0deg;
					--s: 1;
					top: 30%;
					z-index: 1;
					stroke: #fff;
					stroke-dashoffset: 241px;
					stroke-dasharray: 0px 240px; /* Hidden by default (static) */
					transform: rotate(var(--r)) scaleX(var(--s));
				}

				.bolt svg.white.left {
					--r: -20deg;
					left: 0;
				}

				.bolt svg.white.right {
					--r: 20deg;
					--s: -1;
					right: 0;
				}

				.bolt-body {
					display: block;
					position: relative;
				}

				.bolt-body::before,
				.bolt-body::after {
					content: "";
					position: absolute;
					left: 50%;
					top: 44%;
				}

				.bolt-body::before {
					width: 112px;
					height: 112px;
					margin: -56px 0 0 -56px;
					background: #cdd9ed;
					filter: blur(124px);
				}

				.bolt-body::after {
					width: 64px;
					height: 64px;
					margin: -32px 0 0 -32px;
					background: #fff9bc;
					z-index: 1;
					filter: blur(60px);
				}

				/* Default state: fully expanded bolt (for static mode) */
				.bolt-shape {
					display: block;
					width: 126px;
					height: 186px;
					background: var(--bolt);
					clip-path: polygon(
						40% 0%,
						100% 0,
						65% 40%,
						88% 40%,
						8% 100%,
						36% 50%,
						0 50%
					); /* Fully expanded by default */
				}

				/* When NOT animating (collapsed state for continuous mode) */
				.bolt:not(.animate):not(.collapse) .bolt-shape {
					clip-path: polygon(
						36% 40%,
						82% 40%,
						82% 40%,
						82% 40%,
						36% 71%,
						36% 40%,
						36% 40%
					); /* Collapsed state */
				}

				/* When NOT animating, hide glow effects */
				.bolt:not(.animate):not(.collapse) .bolt-body::before,
				.bolt:not(.animate):not(.collapse) .bolt-body::after {
					opacity: 0;
				}

				/* Override for static mode: keep expanded and glowing */
				.bolt:not(.animate):not(.collapse)[data-mode="static"] .bolt-shape {
					clip-path: polygon(
						40% 0%,
						100% 0,
						65% 40%,
						88% 40%,
						8% 100%,
						36% 50%,
						0 50%
					); /* Stay expanded */
				}

				.bolt:not(.animate):not(.collapse)[data-mode="static"] .bolt-body::before,
				.bolt:not(.animate):not(.collapse)[data-mode="static"] .bolt-body::after {
					opacity: 1; /* Keep glow */
				}

				/* Collapse animation */
				.bolt.collapse .bolt-shape {
					animation: collapse-morph 0.8s ease forwards;
				}

				.bolt.collapse .bolt-body::before,
				.bolt.collapse .bolt-body::after {
					animation: collapse-shine 0.8s ease forwards;
				}

				/* When animating: temporarily show sparks, then animate bolt expansion */
				.bolt.animate svg.circle {
					stroke-dasharray: 178px 178px; /* Show sparks during animation */
				}

				.bolt.animate svg.line {
					stroke-dasharray: 70px 70px; /* Show sparks during animation */
				}

				.bolt.animate svg.white {
					stroke-dasharray: 240px 240px; /* Show sparks during animation */
				}

				/* Animation sequence */
				.bolt.animate .bolt-body::before,
				.bolt.animate .bolt-body::after {
					animation: shine-reverse 2s ease;
				}

				.bolt.animate .bolt-shape {
					animation: morph-reverse 2s ease;
				}

				.bolt.animate svg.circle {
					animation: circle-reverse 0.45s cubic-bezier(0.77, 0, 0.175, 1) forwards 0.2s;
				}

				.bolt.animate svg.line {
					animation: line-reverse 0.45s cubic-bezier(0.77, 0, 0.175, 1) forwards 0.2s;
				}

				.bolt.animate svg.white {
					animation: white-reverse 0.45s cubic-bezier(0.77, 0, 0.175, 1) forwards 0.35s;
				}

				.bolt.animate svg.white.right {
					animation-delay: 0.5s;
				}

				/* Reversed keyframes: show sparks initially, then hide them */
				@keyframes circle-reverse {
					0% {
						stroke-dasharray: 178px 178px; /* Start visible */
					}
					100% {
						stroke-dasharray: 0px 178px; /* End hidden */
					}
				}

				@keyframes white-reverse {
					0% {
						stroke-dasharray: 240px 240px; /* Start visible */
					}
					100% {
						stroke-dasharray: 0px 240px; /* End hidden */
					}
				}

				@keyframes line-reverse {
					0% {
						stroke-dasharray: 70px 70px; /* Start visible */
					}
					100% {
						stroke-dasharray: 0px 70px; /* End hidden */
					}
				}

				@keyframes shine-reverse {
					0% {
						opacity: 0; /* Start invisible */
					}
					30% {
						opacity: 1; /* Fade in */
					}
					100% {
						opacity: 1; /* Stay visible */
					}
				}

				/* Bolt expansion: Start collapsed, expand to full, stay expanded */
				@keyframes morph-reverse {
					0% {
						clip-path: polygon(
							36% 40%,
							82% 40%,
							82% 40%,
							82% 40%,
							36% 71%,
							36% 40%,
							36% 40%
						); /* Start collapsed */
					}
					12% {
						clip-path: polygon(
							40% 5%,
							100% 0,
							65% 40%,
							65% 40%,
							8% 100%,
							24% 50%,
							24% 50%
						);
					}
					24%,
					100% {
						clip-path: polygon(
							40% 0%,
							100% 0,
							65% 40%,
							88% 40%,
							8% 100%,
							36% 50%,
							0 50%
						); /* Stay fully expanded */
					}
				}

				/* Collapse animation: reverse of expansion */
				@keyframes collapse-morph {
					0% {
						clip-path: polygon(
							40% 0%,
							100% 0,
							65% 40%,
							88% 40%,
							8% 100%,
							36% 50%,
							0 50%
						); /* Start expanded */
					}
					76% {
						clip-path: polygon(
							40% 5%,
							100% 0,
							65% 40%,
							65% 40%,
							8% 100%,
							24% 50%,
							24% 50%
						);
					}
					100% {
						clip-path: polygon(
							36% 40%,
							82% 40%,
							82% 40%,
							82% 40%,
							36% 71%,
							36% 40%,
							36% 40%
						); /* End collapsed */
					}
				}

				@keyframes collapse-shine {
					0% {
						opacity: 1; /* Start visible */
					}
					100% {
						opacity: 0; /* Fade out */
					}
				}
			`}</style>
		</div>
	);
}

interface LightningLoadingDialogProps {
	open: boolean;
	onClose: (value: boolean) => void;
	text: string;
	animationMode?: AnimationMode;
	showOkButton?: boolean;
	okButtonText?: string;
}

export function LightningLoadingDialog({
	open,
	onClose,
	text,
	animationMode = "static",
	showOkButton = true, // Default to true now
	okButtonText = "OK"
}: LightningLoadingDialogProps): JSX.Element {
	const [showContent, setShowContent] = useState(false);

	function handleAnimationComplete(): void {
		// Start content fade-in after animation completes
		setTimeout(() => {
			setShowContent(true);
		}, 300); // Small delay before fade-in starts
	}

	function handleOkClick(): void {
		onClose(false);
	}

	// Reset content visibility when dialog closes/opens
	useEffect(
		function resetContentVisibility() {
			if (!open) {
				setShowContent(false);
			} else if (animationMode === "static" || animationMode === "continuous") {
				// For static/continuous modes, show content immediately
				setShowContent(true);
			}
		},
		[open, animationMode]
	);
	return (
		<TransparentDialog open={open} onClose={() => onClose(false)}>
			<LightningBolt animationMode={animationMode} />
			<div className="mt-6">
				<p className="text-white  rounded-lg text-sm leading-relaxed">{text}</p>
			</div>
			{showOkButton && (
				<button className="btn-gamify mt-6" onClick={handleOkClick}>
					{okButtonText}
				</button>
			)}
		</TransparentDialog>
	);
}
