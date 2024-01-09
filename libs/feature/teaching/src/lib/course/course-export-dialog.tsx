import { DialogWithReactNodeTitle } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { CourseFormModel } from "./course-form-model";
import { exportCourse } from "@self-learning/lia-exporter";
import { useEffect, useState } from "react";
import { trpc } from "@self-learning/api-client";

export function ExportCourseDialog({
	course,
	onClose
}: {
	course: CourseFormModel;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);
	const [shallExport, setExport] = useState(true);
	const [message, setMessage] = useState(`Exporting: ${course.title}`);

	const { data: courseObj, isLoading } = trpc.course.fullExport.useQuery({ slug: course.slug });

	useEffect(() => {
		if (!isLoading && open) {
			if (courseObj === undefined) return;
			exportCourse(courseObj)
				.then(md => {
					if (shallExport) {
						setExport(false);
						const blob = new Blob([md], { type: "text/plain" });
						const href = URL.createObjectURL(blob);
						const link = document.createElement("a");
						link.href = href;
						link.download = "Course.md";
						document.body.appendChild(link);
						link.click();
						// Clean up and remove the link
						// document.body.removeChild(link);
						// URL.revokeObjectURL(href);
						setOpen(false);
						onClose();
					}
				})
				.catch(error => {
					setExport(false);
					setMessage(`Error: ${error}`);
				});
		}
	}, [open, courseObj, onClose, isLoading, shallExport]);

	if (!open) return null;
	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={`Exporting: ${course.title}`}
				onClose={() => {
					setOpen(false);
					onClose();
				}}
			>
				<CenteredContainer>
					<div className="overlay">"{message}"</div>
					<button
						className="btn-primary w-full"
						type="button"
						onClick={() => {
							setOpen(false);
							onClose();
						}}
					>
						"Close"
					</button>
				</CenteredContainer>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}
