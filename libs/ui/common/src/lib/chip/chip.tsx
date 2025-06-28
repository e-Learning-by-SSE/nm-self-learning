import { XMarkIcon } from "@heroicons/react/24/solid";
import { IconOnlyButton } from "../button/button";
import { ImageOrPlaceholder } from "../image/image-placeholder";

export function Chip({
	children,
	onRemove,
	displayImage,
	imgUrl
}: {
	children: React.ReactNode;
	onRemove?: () => void;
	displayImage: boolean;
	imgUrl?: string | null;
}) {
	return (
		<li className="flex items-center rounded-lg border border-light-border bg-white text-sm">
			{displayImage && (
				<ImageOrPlaceholder
					src={imgUrl ?? undefined}
					className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
				/>
			)}

			<span className="flex w-full flex-col px-4">{children}</span>
			<div className={"px-2 pr-4 mr-2"}>
				{onRemove && (
					<IconOnlyButton icon={<XMarkIcon className="h-5 w-5" />} variant="x-mark" onClick={onRemove} data-testid={"remove"} title="Author Entfernen" />
				)}
			</div>
		</li>
	);
}
