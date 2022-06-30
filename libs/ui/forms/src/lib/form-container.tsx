import { SectionCard as DefaultSectionCard } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";

/**
 * Stacks sections vertically.
 *
 * `flex flex-col gap-32`
 */
export function Container({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-32">{children}</div>;
}

/**
 * A {@link SectionCard} with `relative` positioning. Stacks `children` vertically with `gap-8`.
 */
export function SectionCard({ children }: { children: React.ReactNode }) {
	return <DefaultSectionCard className="relative gap-8">{children}</DefaultSectionCard>;
}

/**
 * A container that uses `90vw` (90% of viewport width) and horizontally centers it's children.
 *
 * @example
 * <Form.MarkdownWithPreviewContainer>
 * 	<MarkdownField
 * 		cacheKey={cacheKey}
 * 		content={value}
 * 		setValue={setValue}
 * 		minHeight="500px"
 * 	/>
 * </Form.MarkdownWithPreviewContainer>
 */
export function MarkdownWithPreviewContainer({ children }: { children: React.ReactNode }) {
	return <div className="mx-auto w-[90vw]">{children}</div>;
}

/**
 * A {@link CenteredContainer} that displays the `title`, `button` and optionally some `specialButtons`,
 * that may be placed using absolute positioning.
 *
 * @example
 * <Form.Title
 * 	title={<span>Neuen <span className="text-indigo-600">Kurs</span> hinzufügen</span>}
 * 	button={
 * 		<button className="btn-primary h-fit w-fit" type="submit">
 * 			Speichern
 * 		</button>
 * 	}
 * 	specialButtons={
 * 		<button
 * 			type="button"
 * 			className="absolute bottom-16 text-sm font-semibold text-secondary"
 * 			onClick={() => setOpenAsJson(true)}
 * 		>
 * 			Als JSON bearbeiten
 * 		</button>
 * 	}
 * />
 */
export function Title({
	specialButtons,
	button,
	title
}: {
	specialButtons?: React.ReactNode;
	button: React.ReactNode;
	title: React.ReactNode;
}) {
	return (
		<CenteredContainer className="relative flex justify-between gap-16 pt-16 pb-24">
			<h1 className="text-3xl sm:text-5xl">{title}</h1>
			{button}
			{specialButtons}
		</CenteredContainer>
	);
}
