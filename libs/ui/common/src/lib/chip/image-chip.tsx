import { XIcon } from "@heroicons/react/solid";
import { ImageOrPlaceholder } from "../image/image-placeholder";
import { Chip } from "./chip";

export function ImageChip({
	children,
	imgUrl,
	onRemove
}: {
	children: React.ReactNode;
	imgUrl?: string | null;
	onRemove?: () => void;
}) {
	return <Chip onRemove={onRemove} displayImage={true} imgUrl={imgUrl}>{children}</Chip>;
}



export { Chip };

