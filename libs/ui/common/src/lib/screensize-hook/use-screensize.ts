import { useState, useEffect } from "react";

// Definiere Tailwind-Breakpoints als konstante Werte (nicht nach außen exportiert)
const tailwindBreakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536
} as const;

// Definiere einen Typ für die verfügbaren Breakpoints
export type ScreenSize = "xs" | keyof typeof tailwindBreakpoints;

/**
 * Hook, der die aktuelle Bildschirmgröße basierend auf Tailwind-Breakpoints zurückgibt
 * @returns Die aktuelle Bildschirmgröße als String ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 */
export function useScreenSize(): ScreenSize {
	const [screenSize, setScreenSize] = useState<ScreenSize>("xs");

	useEffect(() => {
		const determineScreenSize = () => {
			const width = window.innerWidth;

			// Von größter zu kleinster Bildschirmgröße prüfen
			if (width >= tailwindBreakpoints["2xl"]) {
				setScreenSize("2xl");
			} else if (width >= tailwindBreakpoints.xl) {
				setScreenSize("xl");
			} else if (width >= tailwindBreakpoints.lg) {
				setScreenSize("lg");
			} else if (width >= tailwindBreakpoints.md) {
				setScreenSize("md");
			} else if (width >= tailwindBreakpoints.sm) {
				setScreenSize("sm");
			} else {
				setScreenSize("xs");
			}
		};

		// Initiale Bestimmung
		determineScreenSize();

		// Event-Listener für Größenänderungen hinzufügen
		window.addEventListener("resize", determineScreenSize);

		// Cleanup
		return () => window.removeEventListener("resize", determineScreenSize);
	}, []);

	return screenSize;
}

/**
 * Hilfsfunktion, die prüft, ob die aktuelle Bildschirmgröße mindestens die angegebene Größe hat
 * @param currentSize - Die aktuelle Bildschirmgröße
 * @param minSize - Die Mindestgröße zum Vergleich
 * @returns Boolean, ob die aktuelle Größe mindestens die angegebene Größe ist
 */
const isScreenSizeAtLeast = (currentSize: ScreenSize, minSize: ScreenSize): boolean => {
	const sizeOrder: ScreenSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
	return sizeOrder.indexOf(currentSize) >= sizeOrder.indexOf(minSize);
};

/**
 * Hook, der prüft, ob die aktuelle Bildschirmgröße mindestens 'md' (medium) ist
 * @returns Boolean, ob die Bildschirmgröße mindestens Medium ist
 */
export function useIsAtLeastMediumScreen(): boolean {
	const currentSize = useScreenSize();
	return isScreenSizeAtLeast(currentSize, "md");
}

/**
 * Hook, der prüft, ob die aktuelle Bildschirmgröße mindestens 'lg' (large) ist
 * @returns Boolean, ob die Bildschirmgröße mindestens Large ist
 */
export function useIsAtLeastLargeScreen(): boolean {
	const currentSize = useScreenSize();
	return isScreenSizeAtLeast(currentSize, "lg");
}
