import { useRef, useCallback } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

export function FireworkOnClick({ children }: { children: React.ReactNode }) {
	const confettiRef = useRef<((options: any) => void) | null>(null);

	const handleInit = useCallback((instance: { confetti: (options: any) => void }) => {
		confettiRef.current = instance.confetti;
	}, []);

	const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		if (!confettiRef.current) return;

		const { clientX, clientY } = event;
		const { innerWidth, innerHeight } = window;

		const originX = clientX / innerWidth;
		const originY = clientY / innerHeight;

		confettiRef.current({
			particleCount: 100,
			spread: 160,
			startVelocity: 30,
			origin: { x: originX, y: originY },
			ticks: 60,
			gravity: 1,
			scalar: 1,
			zIndex: 1000
		});
	}, []);

	return (
		<div onClick={handleClick}>
			<ReactCanvasConfetti
				onInit={handleInit}
				style={{
					position: "fixed",
					pointerEvents: "none",
					width: "100%",
					height: "100%",
					top: 0,
					left: 0,
					zIndex: 1000
				}}
			/>
			{children}
		</div>
	);
}
