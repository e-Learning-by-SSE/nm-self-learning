import { XIcon } from "@heroicons/react/solid";
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

			{onRemove && (
				<button
					type="button"
					data-testid="remove"
					className="mr-2 rounded-full p-2 hover:bg-gray-50 hover:text-red-500"
					onClick={onRemove}
				>
					<XIcon className="h-3" />
				</button>
			)}
		</li>
	);
}
