import { DetailedHTMLProps, ImgHTMLAttributes } from "react";

export function ImageOrPlaceholder(
	props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
) {
	if (props.src) {
		return <img {...props} alt={props.alt} />;
	}

	return <div className={`bg-c-surface-3 ${props.className}`}></div>;
}
