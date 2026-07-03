"use client";
import { OnDialogCloseFn } from "@self-learning/ui/common";
import { SearchResourceDialog } from "./search-resource-dialog";

export type CourseSearchEntry = { courseId: string; title: string; slug: string };

export function SearchCourseDialog({
	open,
	onClose
}: {
	open: boolean;
	onClose: OnDialogCloseFn<CourseSearchEntry>;
}) {
	return (
		<SearchResourceDialog
			open={open}
			kinds={["course"]}
			onClose={resource => {
				onClose(
					resource
						? { courseId: resource.id, title: resource.title, slug: resource.slug }
						: undefined
				);
			}}
		/>
	);
}
