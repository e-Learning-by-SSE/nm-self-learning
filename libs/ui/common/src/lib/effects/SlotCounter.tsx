import { useState, useEffect, useRef } from "react";

export type SlotCounterProps = {
	targetValue: number;
	startValue?: number;
	duration?: number;
};

export function SlotCounter({ targetValue, startValue = 0, duration = 1000 }: SlotCounterProps) {
	const [displayValue, setDisplayValue] = useState(startValue);
	const [isAnimating, setIsAnimating] = useState(false);
	const animationRef = useRef<{
		startTime: number;
		intermediateValue: number;
		hasAnimated: boolean;
		animationInProgress: boolean;
	}>({ startTime: 0, intermediateValue: 0, hasAnimated: false, animationInProgress: false });

	// Calculate display digits
	const targetDigits = String(targetValue).length;
	const digits = String(displayValue).padStart(targetDigits, "0").split("");

	useEffect(() => {
		// Prevent animation if duration is 0
		if (duration === 0) {
			setDisplayValue(targetValue);
			animationRef.current.hasAnimated = true;
			return undefined;
		}

		// Don't start a new animation if one is already in progress
		if (animationRef.current.animationInProgress) {
			return undefined;
		}

		// Reset the animation state when the targetValue changes or first render
		if (targetValue !== displayValue || !animationRef.current.hasAnimated) {
			setIsAnimating(true);

			// For values that are the same, use an intermediate value to trigger animation
			if (targetValue === startValue && !animationRef.current.hasAnimated) {
				// Calculate an intermediate value that has the same number of digits
				// But make sure we don't show it if duration is 0
				const maxValue = Math.pow(10, targetDigits) - 1;
				const isTargetMax = targetValue === maxValue;

				// If target is max value, go to zero, otherwise go to max
				const intermediateValue = isTargetMax ? 0 : maxValue;

				animationRef.current = {
					startTime: Date.now(),
					intermediateValue,
					hasAnimated: false,
					animationInProgress: true
				};

				// Use requestAnimationFrame for smoother animation handling
				requestAnimationFrame(() => {
					// First set to the intermediate value
					setDisplayValue(intermediateValue);

					// Then set back to the target value after a small delay
					const timer = setTimeout(
						() => {
							setDisplayValue(targetValue);

							// Mark as having animated to prevent infinite loops
							animationRef.current.hasAnimated = true;

							// Reset animation state after animation completes
							const finalTimer = setTimeout(() => {
								setIsAnimating(false);
								animationRef.current.animationInProgress = false;
							}, duration + 50);

							return () => clearTimeout(finalTimer);
						},
						Math.max(50, duration / 10)
					); // Make intermediate delay proportional to duration

					return () => clearTimeout(timer);
				});
			} else {
				// Normal animation to a different target value
				animationRef.current.hasAnimated = true;
				animationRef.current.animationInProgress = true;

				requestAnimationFrame(() => {
					setDisplayValue(targetValue);

					// Reset animation state after duration
					const completeTimer = setTimeout(() => {
						setIsAnimating(false);
						animationRef.current.animationInProgress = false;
					}, duration + 50);

					return () => clearTimeout(completeTimer);
				});
			}
		}

		return undefined;
	}, [targetValue, startValue, displayValue, duration, targetDigits]);

	// Reset the hasAnimated flag when targetValue changes
	useEffect(() => {
		animationRef.current.hasAnimated = false;
	}, [targetValue]);

	return (
		<div className="flex justify-center">
			{digits.map((digit, index) => (
				<div
					key={index}
					className="relative w-16 h-24 mx-1 overflow-hidden rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
				>
					{/* Shadow at the top */}
					<div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black to-transparent z-10"></div>

					{/* Shadow at the bottom */}
					<div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-black z-10"></div>

					{/* Animation for the slot */}
					<div
						className="flex flex-col transition-transform"
						style={{
							transform: `translateY(calc(-${digit} * 10%))`,
							transitionProperty: "transform",
							transitionDuration: `${duration}ms`,
							transitionTimingFunction: "cubic-bezier(0.5, 0, 0.5, 1)",
							height: "1000%" // 10 digits × 100%
						}}
					>
						{/* All possible digits (0-9) */}
						{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
							<div
								key={num}
								className="flex items-center justify-center w-16 h-24 text-4xl font-bold text-white"
							>
								{num}
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
