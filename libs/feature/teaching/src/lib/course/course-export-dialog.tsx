import { DialogWithReactNodeTitle } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { CourseFormModel } from "./course-form-model";
import { exportCourse } from "@self-learning/lia-exporter";
import { useEffect, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { min } from "date-fns";

export function ExportCourseDialog({
	course,
	onClose
}: {
	course: CourseFormModel;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);
	const [message, setMessage] = useState(`Exporting: ${course.title}`);

	const { data, isLoading } = trpc.course.fullExport.useQuery({ slug: course.slug });
	const { data: minioUrl, isLoading: isLoadingUrl } = trpc.storage.getStorageUrl.useQuery();

	const [md, setMd] = useState("");

	// This effect triggers the download after the content was generated
	useEffect(() => {
		if (md !== "") {
			try {
				const blob = new Blob([md], { type: "text/plain" });
				const downloadUrl = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = downloadUrl;
				a.download = `${data?.course.title}.md` ?? "ExportedCourse.md";
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(downloadUrl);
				document.body.removeChild(a);
				setOpen(false);
				onClose();
			} catch (error) {
				// Display error message to user
				setMessage(`Error: ${error}`);
			}
		}
	}, [md, open, onClose, data]);

	// This effect will trigger the content generation after the data was loaded completely
	useEffect(() => {
		if (data && !isLoading && minioUrl && !isLoadingUrl) {
			const convert = async () => {
				setMd(
					await exportCourse(data, {
						storagesToInclude: [minioUrl]
					})
				);
			};

			convert();
		}
	}, [data, isLoading, minioUrl, isLoadingUrl]);

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
