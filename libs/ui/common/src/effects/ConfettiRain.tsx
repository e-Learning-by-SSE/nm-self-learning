import React, { useEffect, useRef, useCallback } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { TCanvasConfettiInstance } from "react-canvas-confetti/dist/types";

interface ConfettiRainProps {
	isActive?: boolean;
	duration?: number;
	colors?: string[];
	particleCount?: number;
	interval?: number;
	gravityBaseValue?: number;
}

export function ConfettiRain({
	isActive = true,
	duration = 1000,
	colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"],
	particleCount = 50,
	interval = 120,
	gravityBaseValue = 2
}: ConfettiRainProps): JSX.Element {
	const confettiRef = useRef<TCanvasConfettiInstance | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const getInstance = useCallback((params: { confetti: TCanvasConfettiInstance }) => {
		confettiRef.current = params.confetti;
		if (!isActive) {
			startConfettiRain();
		}
	}, []);

	const rainConfetti = useCallback((): void => {
		if (!confettiRef.current) return;

		// Mehrere Konfetti-Bursts mit unterschiedlichen realistischen Eigenschaften
		for (let i = 0; i < 5; i++) {
			setTimeout(
				() => {
					if (confettiRef.current) {
						const func = confettiRef.current;
						func({
							particleCount: Math.floor(particleCount / 5) + Math.random() * 5, // Variable Partikelanzahl
							angle: 85 + Math.random() * 10, // Leicht schräger Fall (85-95°)
							spread: 15 + Math.random() * 10, // Geringe, variable Streuung
							origin: {
								x: Math.random(), // Zufällige horizontale Position über die ganze Breite
								y: -0.15 // Startet weiter oberhalb
							},
							colors: colors,
							gravity: gravityBaseValue + Math.random() * 0.4, // Realistische, variable Schwerkraft (1.2-1.6)
							scalar: 0.6 + Math.random() * 0.4, // Variable Partikelgröße (0.6-1.0)
							drift: (Math.random() - 0.5) * 0.8, // Subtiles seitliches Driften durch "Wind"
							ticks: 400 + Math.random() * 150, // Variable Lebensdauer (längerer Fall)
							shapes: ["square", "circle"],
							startVelocity: 10 + Math.random() * 15, // Niedrigere, variable Startgeschwindigkeit
							// Realistische Rotation und Widerstand
							decay: 0.94 + Math.random() * 0.04 // Luftwiderstand-Simulation
						});
					}
				},
				i * (30 + Math.random() * 40)
			); // Variable Timing zwischen Bursts
		}
	}, [particleCount, colors, gravityBaseValue]);

	const startConfettiRain = useCallback((): void => {
		if (!isActive) return;

		// Sofort starten
		rainConfetti();

		// Kontinuierlicher Regen
		intervalRef.current = setInterval(rainConfetti, interval);

		// Nach der angegebenen Dauer stoppen
		timeoutRef.current = setTimeout(() => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}, duration);
	}, [isActive, rainConfetti, interval, duration]);

	const stopConfetti = useCallback((): void => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (isActive && confettiRef.current) {
			startConfettiRain();
		} else {
			stopConfetti();
		}

		// Cleanup beim Unmount
		return () => {
			stopConfetti();
		};
	}, [isActive, startConfettiRain, stopConfetti]);

	// Canvas-Styling für Vollbild-Overlay
	const canvasStyles: React.CSSProperties = {
		position: "fixed",
		pointerEvents: "none",
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
		zIndex: 1000
	};

	return <ReactCanvasConfetti onInit={getInstance} style={canvasStyles} />;
}
