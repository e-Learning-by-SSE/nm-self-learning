import { DialogWithReactNodeTitle, ProgressBar } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { CourseFormModel } from "./course-form-model";
import { IncompleteNanoModuleExport, exportCourseArchive } from "@self-learning/lia-exporter";
import { useEffect, useState, useRef, useMemo } from "react";
import { trpc } from "@self-learning/api-client";
import { IncompleteExportSynopsis } from "./incomplete-export-synopsis";

export function ExportCourseDialog({
	course,
	onClose
}: {
	course: CourseFormModel;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);
	const [message, setMessage] = useState(`Export: ${course.title}`);
	const [title, setTitle] = useState(`Exportiere: ${course.title}`);

	const { data, isLoading } = trpc.course.fullExport.useQuery({ slug: course.slug });

	const [exportResult, setExportResult] = useState<Blob | null>(null);
	const [errorReport, setErrorReport] = useState<IncompleteNanoModuleExport[]>([]);

	const [progress, setProgress] = useState(0);
	const [lblClose, setCloseLabel] = useState("Abbrechen");
	const abortController = useRef(new AbortController());

	// Optional public env variable that indicates were the storage is located
	const minioUrl = process.env["NEXT_PUBLIC_MINIO_PUBLIC_URL"];
	const storagesToInclude = useMemo(() => {
		const storagesToInclude = ["https://staging.sse.uni-hildesheim.de:9006/upload/"];
		minioUrl && storagesToInclude.push(minioUrl);
		return storagesToInclude;
	}, [minioUrl]);

	// This effect triggers the download after the content was generated
	useEffect(() => {
		if (exportResult) {
			try {
				const blob = new Blob([exportResult], { type: "blob" });
				const downloadUrl = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = downloadUrl;
				a.download = `${course.title}.zip`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(downloadUrl);
				document.body.removeChild(a);
				if (errorReport.length === 0) {
					setOpen(false);
					onClose();
				}
			} catch (error) {
				// Display error message to user
				setCloseLabel("Schließen");
				setMessage(`Error: ${error}`);
			}
		}
	}, [exportResult, open, course, onClose, errorReport]);

	// This effect will trigger the content generation after the data was loaded completely
	useEffect(() => {
		if (data && !isLoading) {
			const convert = async () => {
				try {
					const { zipArchive, incompleteExportedItems } = await exportCourseArchive(
						data,
						abortController.current.signal,
						setProgress,
						setMessage,
						{
							storagesToInclude
						}
					);
					if (zipArchive) {
						setExportResult(zipArchive);
					}
					if (incompleteExportedItems.length > 0) {
						const element =
							incompleteExportedItems.length > 1 ? "einige Elemente" : "ein Element";
						setTitle(`${course.title} erfolgreich exportiert`);
						setMessage(
							`Für ${element} wurde der Export nicht vollständig unterstützt.`
						);
						setErrorReport(incompleteExportedItems);
						setCloseLabel("Schließen");
					}
				} catch (error) {
					// Display error message to user
					setCloseLabel("Schließen");
					setMessage(`Error: ${error}`);
				}
			};

			convert();
		}
	}, [data, isLoading, course.title, storagesToInclude]);

	if (!open) return null;
	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={title}
				onClose={() => {
					abortController.current.abort();
					setOpen(false);
					onClose();
				}}
			>
				{progress < 100 && <ProgressBar progress={progress} />}
				{errorReport.length > 0 && (
					<IncompleteExportSynopsis report={errorReport} course={course} />
				)}
				<div className="overlay">{message}</div>
				<div className="grid justify-items-end">
					<button
						className="btn-primary w-min "
						type="button"
						onClick={() => {
							abortController.current.abort();
							setOpen(false);
							onClose();
						}}
					>
						{lblClose}
					</button>
				</div>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}
