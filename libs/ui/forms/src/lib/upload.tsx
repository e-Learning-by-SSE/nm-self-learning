import { trpc } from "@self-learning/api-client";
import { ReactElement, useId } from "react";

export function Upload({
	mediaType,
	onUploadCompleted,
	preview
}: {
	mediaType: "image" | "video" | "pdf";
	onUploadCompleted: (publicUrl: string, meta?: { duration: number }) => void;
	preview: ReactElement;
}) {
	const id = useId(); // Each file input requires a unique id ... otherwise browser will always pick the first one
	const { mutateAsync: getPresignedUrl } = trpc.storage.getPresignedUrl.useMutation();

	const accept = {
		image: "image/*",
		video: "video/*",
		pdf: "application/pdf"
	}[mediaType];

	function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			console.log("No file selected.");
			return;
		}

		console.log(file);

		const meta = {
			duration: 0
		};

		if (mediaType === "video") {
			const vid = document.createElement("video");
			vid.src = URL.createObjectURL(file);

			vid.onloadedmetadata = () => {
				meta.duration = Math.floor(vid.duration);
			};
		}

		getPresignedUrl({ filename: file.name }).then(({ presignedUrl, publicUrl }) => {
			console.log("Presigned URL:", presignedUrl);

			uploadFile(file, presignedUrl).then(() => {
				console.log("File uploaded to:", publicUrl);
				onUploadCompleted(publicUrl, meta);
			});
		});
	}

	return (
		<div className="relative flex flex-col gap-4">
			<label className="btn-primary" htmlFor={id}>
				{mediaType === "video"
					? "Video hochladen"
					: mediaType === "image"
					? "Bild hochladen"
					: "Datei hochladen"}
			</label>
			<input
				type="file"
				id={id}
				accept={accept}
				onChange={handleUpload}
				style={{
					visibility: "hidden",
					position: "absolute"
				}}
			/>
			{preview}
		</div>
	);
}

async function uploadFile(file: File, url: string): Promise<void> {
	const res = await fetch(url, {
		method: "PUT",
		body: file
	});

	console.log("Upload response:", res);

	if (!res.ok) {
		throw new Error("Failed to upload file");
	}
}
