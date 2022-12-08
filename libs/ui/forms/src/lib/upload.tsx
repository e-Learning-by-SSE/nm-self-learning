import { CloudDownloadIcon } from "@heroicons/react/outline";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { formatDateAgo } from "@self-learning/util/common";
import { parseISO } from "date-fns";
import { ReactElement, useId, useMemo, useState } from "react";
import { SearchField } from "./searchfield";

type MediaType = "image" | "video" | "pdf";

export function Upload({
	mediaType,
	onUploadCompleted,
	preview
}: {
	mediaType: MediaType;
	onUploadCompleted: (publicUrl: string, meta?: { duration: number }) => void;
	preview: ReactElement;
}) {
	const id = useId(); // Each file input requires a unique id ... otherwise browser will always pick the first one
	const { mutateAsync: getPresignedUrl } = trpc.storage.getPresignedUrl.useMutation();
	const { mutateAsync: registerAsset } = trpc.storage.registerAsset.useMutation();
	const trpcContext = trpc.useContext();

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

				registerAsset({ filename: file.name, publicUrl, filetype: mediaType })
					.then(() => {
						console.log("Asset registered.");
						trpcContext.storage.invalidate();
					})
					.catch(err => {
						console.log("Failed to register asset.");
						console.error(err);
					});
			});
		});
	}

	return (
		<div className="relative flex flex-col gap-4">
			<div className="flex gap-1">
				<label className="btn-primary w-full" htmlFor={id}>
					{mediaType === "video"
						? "Video hochladen"
						: mediaType === "image"
						? "Bild hochladen"
						: "Datei hochladen"}
				</label>

				<AssetPickerButton
					mediaType={mediaType}
					onClose={url => url && onUploadCompleted(url)}
				/>
			</div>
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

function AssetPickerButton({
	onClose,
	mediaType
}: {
	onClose: OnDialogCloseFn<string>;
	mediaType: MediaType;
}) {
	const [showAssetPicker, setShowAssetPicker] = useState(false);

	return (
		<button
			type="button"
			className="h-fit rounded-lg border border-light-border px-2 py-2"
			title="Aus hochgeladenen Dateien auswählen"
			onClick={() => setShowAssetPicker(true)}
		>
			<CloudDownloadIcon className="h-5" />

			{showAssetPicker && (
				<AssetPickerDialog
					mediaType={mediaType}
					onClose={url => {
						setShowAssetPicker(false);
						onClose(url);
					}}
				/>
			)}
		</button>
	);
}

function AssetPickerDialog({
	mediaType,
	onClose
}: {
	mediaType?: MediaType;
	onClose: OnDialogCloseFn<string>;
}) {
	const { data: assets, isLoading } = trpc.storage.getMyAssets.useQuery();
	const [filter, setFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState<MediaType | undefined>(mediaType);

	const filteredAssets = useMemo(() => {
		if (!assets) {
			return [];
		}

		const trimmedFilter = filter.trim();

		if (trimmedFilter.length === 0 && !typeFilter) {
			return assets;
		}

		return assets.filter(
			asset =>
				(mediaType ? asset.filetype === mediaType : true) && // Filter by media type
				asset.filename.toLowerCase().includes(trimmedFilter.toLowerCase()) // Filter by filename
		);
	}, [assets, filter, typeFilter, mediaType]);

	return (
		<Dialog
			title="Hochgeladene Dateien"
			onClose={onClose}
			className="max-h-[80vh] w-[80vw] xl:min-h-[50vh] 2xl:w-[50vw]"
		>
			<span className="absolute bottom-8 left-8 text-xs text-light">
				type: {mediaType ? mediaType : "all"}
			</span>

			<div className="flex flex-col overflow-auto">
				<SearchField
					placeholder="Suche nach Datei..."
					value={filter}
					onChange={e => setFilter(e.target.value)}
				/>

				<ul className="flex flex-col">
					{isLoading ? (
						<LoadingBox height={256} />
					) : filteredAssets.length === 0 ? (
						<span className="text-sm text-light">Keine Dateien gefunden.</span>
					) : (
						<Table
							head={
								<>
									<TableHeaderColumn>Preview</TableHeaderColumn>
									<TableHeaderColumn>Datei</TableHeaderColumn>
									<TableHeaderColumn>Typ</TableHeaderColumn>
									<TableHeaderColumn>Datum</TableHeaderColumn>
									<TableHeaderColumn></TableHeaderColumn>
								</>
							}
						>
							{filteredAssets.map(asset => (
								<tr key={asset.publicUrl}>
									<TableDataColumn>
										{asset.filetype === "image" ? (
											<img
												className="h-16 w-24 rounded-lg object-cover "
												src={asset.publicUrl}
												alt="Preview"
											/>
										) : (
											<div className="h-16 w-24 rounded-lg bg-gray-200"></div>
										)}
									</TableDataColumn>
									<TableDataColumn>
										<div className="flex flex-col gap-1">
											<span className="font-medium">{asset.filename}</span>
											<a
												className="text-xs text-light hover:underline"
												target="blank"
												rel="noreferrer"
												href={asset.publicUrl}
											>
												{asset.publicUrl}
											</a>
										</div>
									</TableDataColumn>
									<TableDataColumn>{asset.filetype}</TableDataColumn>
									<TableDataColumn>
										<span title={parseISO(asset.createdAt).toLocaleString()}>
											{formatDateAgo(asset.createdAt)}
										</span>
									</TableDataColumn>
									<TableDataColumn>
										<button
											className="btn-primary"
											onClick={() => onClose(asset.publicUrl)}
										>
											Auswählen
										</button>
									</TableDataColumn>
								</tr>
							))}
						</Table>
					)}
				</ul>
			</div>

			<DialogActions onClose={onClose}></DialogActions>
		</Dialog>
	);
}
