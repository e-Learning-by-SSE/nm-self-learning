import { VideoPlayer } from "@self-learning/ui/lesson";
import { useState } from "react";
import { supabase } from "./supabase";

export function ImageUploadWidget({
	url,
	size,
	onUpload
}: {
	url?: string | null;
	size: number | string;
	onUpload: (filepath: string) => void;
}) {
	const [uploading, setUploading] = useState(false);

	async function uploadImage(event: any) {
		try {
			setUploading(true);

			if (!event.target.files || event.target.files.length === 0) {
				throw new Error("You must select an image to upload.");
			}

			const file = event.target.files[0];
			const fileExt = file.name.split(".").pop();
			const fileName = `${Math.random().toString(16).slice(2)}.${fileExt}`;
			const filePath = `${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from("images")
				.upload(filePath, file);

			if (uploadError) {
				throw uploadError;
			}

			onUpload(filePath);
		} catch (error) {
			alert((error as { message: string }).message);
		} finally {
			setUploading(false);
		}
	}

	return (
		<div>
			{url ? (
				<img
					src={url}
					alt=""
					className="rounded-lg object-cover"
					style={{ height: size, width: size }}
				/>
			) : (
				<div className="rounded-lg bg-neutral-300" style={{ height: size, width: size }} />
			)}
			<div className="btn-primary mt-4 w-fit">
				<label className="button primary block" htmlFor="single">
					{uploading ? "Uploading ..." : "Upload"}
				</label>
				<input
					style={{
						visibility: "hidden",
						position: "absolute"
					}}
					type="file"
					id="single"
					accept="image/*"
					onChange={uploadImage}
					disabled={uploading}
				/>
			</div>
		</div>
	);
}

export function VideoUploadWidget({
	url,
	onUpload
}: {
	url: string | null;
	onUpload: (filepath: string) => void;
}) {
	const [uploading, setUploading] = useState(false);

	async function uploadVideo(event: any) {
		try {
			setUploading(true);

			if (!event.target.files || event.target.files.length === 0) {
				throw new Error("You must select an image to upload.");
			}

			const file = event.target.files[0];
			const fileExt = file.name.split(".").pop();
			const fileName = `${Math.random().toString(16).slice(2)}.${fileExt}`;
			const filePath = `${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from("videos")
				.upload(filePath, file);

			if (uploadError) {
				throw uploadError;
			}

			onUpload(filePath);
		} catch (error) {
			alert((error as { message: string }).message);
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="flex flex-col">
			<div className="aspect-video w-full bg-neutral-500">
				<VideoPlayer url={url as string} />
			</div>

			<div className="btn-primary mt-8 w-fit">
				<label className="button primary block" htmlFor="video-upload">
					{uploading ? "Uploading ..." : "Upload"}
				</label>
				<input
					style={{
						visibility: "hidden",
						position: "absolute"
					}}
					id="video-upload"
					name="video-upload"
					type="file"
					accept="video/mp4,video/x-m4v,video/*"
					onChange={uploadVideo}
					disabled={uploading}
				/>
			</div>
		</div>
	);
}
