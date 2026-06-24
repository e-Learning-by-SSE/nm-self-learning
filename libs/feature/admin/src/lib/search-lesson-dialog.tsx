"use client";
import { OnDialogCloseFn } from "@self-learning/ui/common";
import { SearchResourceDialog } from "./search-resource-dialog";

export type LessonSearchEntry = { lessonId: string; title: string; slug: string };

export function SearchLessonDialog({
	open,
	onClose
}: {
	open: boolean;
	onClose: OnDialogCloseFn<LessonSearchEntry>;
}) {
	return (
		<SearchResourceDialog
			open={open}
			kinds={["lesson"]}
			onClose={resource => {
				onClose(
					resource
						? { lessonId: resource.id, title: resource.title, slug: resource.slug }
						: undefined
				);
			}}
		/>
	);
}
