import { Chip } from "./image-chip";

export function TextChip({
	children,
	onRemove
}: {
	children: React.ReactNode;
	onRemove?: () => void;
}) {
	return (
		<Chip onRemove={onRemove} displayImage={false}>
			{children}
		</Chip>
	);
}
