import { DetailedHTMLProps, ImgHTMLAttributes } from "react";

export function ImageOrPlaceholder(
	props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
) {
	if (props.src) {
		return <img {...props} alt={props.alt} />;
	}

	return <div className={`bg-gray-200 ${props.className}`}></div>;
}
