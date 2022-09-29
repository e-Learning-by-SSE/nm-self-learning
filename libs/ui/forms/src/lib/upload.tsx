import { trpc } from "@self-learning/api-client";
import { useState } from "react";

export function Upload({ mediaType }: { mediaType: "image" | "video" }) {
	const [publicUrl, setPublicUrl] = useState<string | null>(null);

	const { mutateAsync: getPresignedUrl } = trpc.storage.getPresignedUrl.useMutation();

	let acceptedFiles: string | undefined = undefined;

	if (mediaType === "image") {
		acceptedFiles = "image/*";
	} else if (mediaType === "video") {
		acceptedFiles = "video/mp4,video/x-m4v,video/*";
	}

	function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			console.log("No file selected.");
			return;
		}

		console.log(file);

		getPresignedUrl({ filename: file.name }).then(({ presignedUrl, publicUrl }) => {
			console.log("Presigned URL:", presignedUrl);

			uploadFile(file, presignedUrl).then(() => {
				console.log("File uploaded to:", publicUrl);
				setPublicUrl(publicUrl);
			});
		});
	}

	return (
		<div className="relative flex flex-col gap-4 py-8">
			{publicUrl ? (
				<>
					{mediaType === "image" && <img src={publicUrl} alt="Uploaded file" />}
					{mediaType === "video" && <video src={publicUrl} controls />}
				</>
			) : (
				<div className="h-64 w-full rounded-lg bg-gray-200"></div>
			)}

			<label className="btn-primary" htmlFor="file">
				{mediaType === "video" && "Video hochladen"}
				{mediaType === "image" && "Bild hochladen"}
			</label>
			<input
				type="file"
				id="file"
				accept={acceptedFiles}
				onChange={handleUpload}
				style={{
					visibility: "hidden",
					position: "absolute"
				}}
			/>
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
