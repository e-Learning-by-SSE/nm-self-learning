import { useEffect, useState } from "react";
import styles from "./Flame.module.scss";
import { useTimeout } from "../timer/timer";

interface FlameBackgroundProps {
	/** Child elements to display over the flame background */
	children?: React.ReactNode;
	/** Optional CSS class name to apply to the container */
	className?: string;
	/** Optional inline styles to apply to the container */
	style?: React.CSSProperties;
	/** Optional flag to indicate if the flame should be blue */
	isBlue?: boolean;
}

/**
 * FlameBackground Component
 *
 * Creates a responsive flame animation as a background for any content.
 * The flames dynamically adjust to the container size.
 *
 * @example
 * // Basic usage with Tailwind
 * <FlameBackground className="w-full h-64">
 *   <h2 className="text-white font-bold">Text on flames</h2>
 * </FlameBackground>
 *
 * @example
 * // With custom sizing using Tailwind
 * <div className="w-72 h-48">
 *   <FlameBackground>
 *     <h2 className="text-white font-bold">Sized flame background</h2>
 *   </FlameBackground>
 * </div>
 *
 * @example
 * // With offset content
 * <FlameBackground className="w-full h-64">
 *   <div className="-translate-y-5">
 *     <h2 className="text-white font-bold">Offset content</h2>
 *   </div>
 * </FlameBackground>
 */
export function AnimatedFlame({ children, className, style, isBlue }: FlameBackgroundProps) {
	const particles = Array.from({ length: 50 }, (_, i) => (
		<div key={i} className={styles["particle"]}></div>
	));

	const flameClass = isBlue ? styles["blueFlame"] : styles["flame"];

	return (
		<div className={`${styles["container"]} ${className || ""}`} style={style}>
			<div className={styles["flameContainer"]}>
				<div className={`${styles["fire"]} ${flameClass}`}>{particles}</div>
			</div>
			<div className={styles["content"]}>{children}</div>
		</div>
	);
}

export function FlameOverlay({
	children,
	className,
	duration,
	isVisible = true
}: {
	children: React.ReactNode;
	className?: string;
	duration?: number;
	isVisible?: boolean;
}) {
	const [_isVisible, setIsVisible] = useState(isVisible);

	useTimeout({
		callback: () => {
			if (duration) {
				setIsVisible(false);
			}
		},
		delayInMilliseconds: duration || 0
	});

	return (
		<div className={`relative ${className || ""}`}>
			{/* Hintergrund-Flamme */}
			<div
				className={`absolute inset-0 transition-opacity duration-700 ease-out ${
					_isVisible ? "opacity-100" : "opacity-0"
				}`}
			>
				<AnimatedFlame className="w-full h-full" isBlue />
			</div>
			{/* Vordergrund-Inhalt */}
			<div className="relative z-10">{children}</div>
		</div>
	);
}
