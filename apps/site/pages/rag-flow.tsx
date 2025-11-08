import { trpc } from "@self-learning/api-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IngestionInput } from "@self-learning/types";
import { CenteredSection } from "@self-learning/ui/layouts";
import { Upload } from "@self-learning/ui/forms";

export default function RagFlowPage() {
	const { register, handleSubmit, watch, setValue } = useForm<IngestionInput>();
	const [response, setResponse] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [files, setFiles] = useState<Array<{ url: string; fileName: string }>>([]);
	const ingestCourse = trpc.rag.ingestCourse.useMutation();

	const onSubmit = async (data: IngestionInput) => {
		setLoading(true);
		setResponse(null);
		try {
			const result = await ingestCourse.mutateAsync({
				courseId: data.courseId,
				courseName: data.courseName,
				files: data.files
			});
			setResponse(`Ingestion successful: ${JSON.stringify(result)}`);
		} catch (error) {
			setResponse(
				`Ingestion failed: ${error instanceof Error ? error.message : String(error)}`
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<CenteredSection>
			<div>
				<h1>RAG Flow Page</h1>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div>
						<label>Course ID:</label>
						<input {...register("courseId", { required: true })} />
					</div>
					<div>
						<label>Course Name:</label>
						<input {...register("courseName", { required: true })} />
					</div>
					<div>
						<label>PDF Files:</label>
						<Upload
							mediaType="pdf"
							hideAssetPicker={true}
							onUploadCompleted={url => {
								const fileName = url.split("/").pop() || "unknown.pdf";
								const newFile = { url, fileName };
								setFiles(prev => [...prev, newFile]);
								setValue("files", [...(watch("files") || []), newFile]);
							}}
						/>
						<div>
							{/* Display selected file names */}
							{(watch("files") || []).map((file, index) => (
								<div key={index}>
									{file.fileName} <span>{file.url}</span>
								</div>
							))}
						</div>
					</div>
					<button type="submit" disabled={loading}>
						{loading ? "Ingesting..." : "Ingest Course"}
					</button>
				</form>
				{response && (
					<div>
						<h2>Response:</h2>
						<pre>{response}</pre>
					</div>
				)}
			</div>
		</CenteredSection>
	);
}
