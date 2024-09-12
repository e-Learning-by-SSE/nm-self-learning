import React from "react";
import Image, { ImageProps } from "next/image";

interface SelflearnLogoProps extends Partial<ImageProps> {
	width: number;
	height: number;
}

export function SelflearnLogo({ width, height, ...props }: SelflearnLogoProps) {
	return (
		<Image
			src="/assets/logo-selflearning.png"
			alt="Selflearn Logo"
			width={width}
			height={height}
			{...props}
		/>
	);
}
