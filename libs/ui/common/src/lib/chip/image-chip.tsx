import { XMarkIcon } from "@heroicons/react/24/solid";
import { ImageOrPlaceholder } from "../image/image-placeholder";

export function ImageChip({
	children,
	imgUrl,
	onRemove
}: {
	children: React.ReactNode;
	imgUrl?: string | null;
	onRemove?: () => void;
}) {
	return (
		<li className="flex items-center rounded-lg border border-light-border bg-white text-sm">
			<ImageOrPlaceholder
				src={imgUrl ?? undefined}
				className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
			/>

			<span className="flex w-full flex-col px-4">{children}</span>

			{onRemove && (
				<button
					type="button"
					data-testid="remove"
					className="mr-2 rounded-full p-2 hover:bg-gray-50 hover:text-red-500"
					onClick={onRemove}
				>
					<XMarkIcon className="h-3" />
				</button>
			)}
		</li>
	);
}
