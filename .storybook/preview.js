import * as NextImage from "next/image";
import "../apps/site/pages/styles.css";

const OriginalNextImage = NextImage.default;

Object.defineProperty(NextImage, "default", {
	configurable: true,
	value: props => <OriginalNextImage {...props} unoptimized />
});
