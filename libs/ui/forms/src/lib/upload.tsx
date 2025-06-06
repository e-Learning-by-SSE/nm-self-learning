"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	Paginator,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { formatDateAgo } from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import { ReactElement, useId, useMemo, useState } from "react";
import { SearchField } from "./searchfield";
import { UploadProgressDialog } from "./upload-progress-dialog";

const MediaType = {
	image: "image",
	video: "video",
	pdf: "pdf"
} as const;

type MediaType = keyof typeof MediaType;

export function Upload({
	mediaType,
	onUploadCompleted,
	preview,
	hideAssetPicker
}: {
	mediaType?: MediaType;
	onUploadCompleted: (publicUrl: string, meta?: { duration: number }) => void;
	preview?: ReactElement;
	/** If `true`, button to open asset picker is not rendered. */
	hideAssetPicker?: boolean;
}) {
	const id = useId(); // Each file input requires a unique id ... otherwise browser will always pick the first one
	const { mutateAsync: getPresignedUrl } = trpc.storage.getPresignedUrl.useMutation();
	const { mutateAsync: registerAsset } = trpc.storage.registerAsset.useMutation();
	const [viewProgressDialog, setViewProgressDialog] = useState(false);
	const [progress, setProgress] = useState(0);
	const [fileName, setFileName] = useState("");

	const accept = useMemo(() => {
		const mediaTypes = {
			image: "image/*",
			video: "video/*",
			pdf: "application/pdf"
		};

		let accept: string | undefined;

		if (mediaType) {
			accept = mediaTypes[mediaType];
		} else if (!accept) {
			accept = Object.values(mediaTypes).join(",");
		}

		return accept;
	}, [mediaType]);

	async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			console.log("No file selected.");
			return;
		}

		console.log(file);

		const objectName = window.crypto.randomUUID();
		const fileName = file.name;
		setFileName(fileName);
		const fileType = tryGetMediaType(file) ?? "unknown";

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

		try {
			const { presignedUrl, downloadUrl } = await getPresignedUrl({ filename: objectName });

			const onFinish = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
				const status = e.type === "loadend" ? "finished" : "failed";
				console.log(`File upload to ${downloadUrl} ${status}.`);
				setFileName("");
				onUploadCompleted(downloadUrl, meta);
				setViewProgressDialog(false);
			};
			await uploadWithProgress(
				presignedUrl,
				file,
				() => setViewProgressDialog(true),
				setProgress,
				onFinish
			);

			try {
				// TODO: Requires public download option -> Implement download via presignedUrl
				await registerAsset({ objectName, publicUrl: downloadUrl, fileType, fileName });
			} catch (error) {
				console.log("Failed to register asset.");
				console.error(error);
			}
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.httpStatus === 500) {
				if (error.data.stack?.startsWith("Error: connect ECONNREFUSED")) {
					console.error(
						"MinIO server not reachable. Possible cause: Server not started or misconfigured."
					);
				}
			}

			console.error("Upload Error:", error);
			showToast({
				type: "error",
				title: "Upload fehlgeschlagen",
				subtitle:
					"Upload fehlgeschlagen. Wenn der Fehler länger bestehen bleibt, kontaktieren Sie bitte einen Administrator."
			});
		}
	}

	return (
		<div className="relative flex flex-col gap-4">
			{viewProgressDialog && <UploadProgressDialog name={fileName} progress={progress} />}

			<div className="flex gap-1">
				<label className="btn-primary w-full" htmlFor={id}>
					{mediaType === "video"
						? "Video hochladen"
						: mediaType === "image"
							? "Bild hochladen"
							: "Datei hochladen"}
				</label>

				{!hideAssetPicker && (
					<AssetPickerButton
						mediaType={mediaType}
						onClose={url => url && onUploadCompleted(url)}
					/>
				)}
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

function tryGetMediaType(file: File): MediaType | null {
	const [type, extension] = file.type.split("/");
	const isTypeValid = MediaType[type as MediaType];
	const isExtensionValid = MediaType[extension as MediaType];

	if (isTypeValid) {
		return type as MediaType;
	} else if (isExtensionValid) {
		return extension as MediaType;
	} else {
		return null;
	}
}

async function uploadWithProgress(
	url: string,
	file: File,
	showDialog: () => void,
	onProgress: (bytes: number) => void,
	onComplete: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void
) {
	showDialog();

	// Upload with progress based on XHR
	// Based on https://www.sitepoint.com/html5-javascript-file-upload-progress-bar/
	const xhr = new XMLHttpRequest();

	// Set progress to 0% before start
	onProgress(0);

	xhr.upload.addEventListener(
		"progress",
		function (e) {
			const pc = (e.loaded / e.total) * 100;
			onProgress(pc);
		},
		false
	);

	// Event listener for (un)successful finishing the task.
	// List of listener types: https://stackoverflow.com/a/15491086
	xhr.upload.addEventListener("loadend", onComplete, false);

	// start upload
	//Returns the filename containing only ASCII letters, numbers and dots.
	//All other characters (including spaces and special characters) are replaced with underscores.
	const sanitizedFilename = file.name.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^\x20-\x7E]/g, "")
			.replace(/[^a-zA-Z0-9.]/g, "_");
	xhr.open("PUT", url, true);
	xhr.setRequestHeader("X-FILENAME", sanitizedFilename);
	xhr.send(file);
}

export function AssetPickerButton({
	onClose,
	mediaType,
	copyToClipboard
}: Parameters<typeof AssetPickerDialog>[0]) {
	const [showAssetPicker, setShowAssetPicker] = useState(false);

	return (
		<button
			type="button"
			className="btn-icon"
			title="Aus hochgeladenen Dateien auswählen"
			onClick={() => setShowAssetPicker(true)}
		>
			<CloudArrowUpIcon className="h-5" />

			{showAssetPicker && (
				<AssetPickerDialog
					copyToClipboard={copyToClipboard}
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

type Asset = inferRouterOutputs<AppRouter>["storage"]["getMyAssets"]["result"][0];

function AssetPickerDialog({
	mediaType,
	onClose,
	copyToClipboard
}: {
	mediaType?: MediaType;
	/** Returns the URL of the selected asset.  */
	onClose: OnDialogCloseFn<string>;
	/** If `true`, choosing an assets will copy its URL to the clipboard. */
	copyToClipboard?: boolean;
}) {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState("");
	const { data } = trpc.storage.getMyAssets.useQuery(
		{
			fileName: filter,
			page
		},
		{
			keepPreviousData: true
		}
	);

	const filteredAssets = useMemo(() => {
		if (!data) {
			return [];
		}

		const trimmedFilter = filter.trim();

		if (trimmedFilter.length === 0) {
			return data.result;
		}

		return data.result.filter(
			asset => asset.fileName.toLowerCase().includes(trimmedFilter.toLowerCase()) // Filter by filename
		);
	}, [data, filter]);

	return (
		<Dialog
			title="Hochgeladene Dateien"
			onClose={onClose}
			className="max-h-[80vh] w-[80vw] overflow-auto 2xl:w-[60vw]"
		>
			<span className="absolute bottom-8 left-8 text-xs text-light">
				type: {mediaType ? mediaType : "all"}
			</span>

			<div className="flex h-full flex-col justify-between">
				<div className="flex flex-col xl:min-h-[50vh]">
					<div className="absolute top-8 right-8">
						{" "}
						<Upload
							onUploadCompleted={() => {
								// Reset filter so user sees uploaded file on top
								setFilter("");
							}}
							hideAssetPicker={true}
						/>
					</div>

					<SearchField
						placeholder="Suche nach Datei..."
						value={filter}
						onChange={e => setFilter(e.target.value)}
					/>
					<span className="flex flex-wrap gap-4"></span>

					<ul className="flex max-h-[50vh] flex-col">
						{!data ? (
							<LoadingBox height={256} />
						) : filteredAssets.length === 0 ? (
							<span className="text-sm text-light">Keine Dateien gefunden.</span>
						) : (
							<>
								<Table
									head={
										<>
											<TableHeaderColumn></TableHeaderColumn>
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
											<TableDataColumn className="pl-4">
												<AssetOptionsMenu asset={asset} />
											</TableDataColumn>
											<TableDataColumn>
												{asset.fileType === "image" ? (
													<img
														className="h-16 w-24 shrink-0 rounded-lg object-cover"
														src={asset.publicUrl}
														alt="Preview"
													/>
												) : (
													<div className="h-16 w-24 shrink-0 rounded-lg bg-gray-200"></div>
												)}
											</TableDataColumn>
											<TableDataColumn>
												<a
													className="font-medium hover:text-secondary"
													target="blank"
													rel="noreferrer"
													href={asset.publicUrl}
												>
													{asset.fileName}
												</a>
											</TableDataColumn>
											<TableDataColumn>{asset.fileType}</TableDataColumn>
											<TableDataColumn>
												<span title={asset.createdAt.toLocaleString()}>
													{formatDateAgo(asset.createdAt)}
												</span>
											</TableDataColumn>
											<TableDataColumn>
												<div className="flex justify-end">
													<button
														className="btn-primary"
														onClick={() => {
															if (copyToClipboard) {
																navigator.clipboard.writeText(
																	asset.publicUrl
																);
																showToast({
																	type: "info",
																	title: "In Zwischenablage kopiert",
																	subtitle: asset.publicUrl
																});
															}

															onClose(asset.publicUrl);
														}}
													>
														{copyToClipboard
															? "URL in Zwischenablage kopieren"
															: "Auswählen"}
													</button>
												</div>
											</TableDataColumn>
										</tr>
									))}
								</Table>

								<Paginator pagination={data} onPageChange={setPage} url={"#"} />
							</>
						)}
					</ul>
				</div>

				<DialogActions onClose={onClose}></DialogActions>
			</div>
		</Dialog>
	);
}

function AssetOptionsMenu({ asset }: { asset: Asset }) {
	const { mutateAsync: removeFromStorageServer } = trpc.storage.removeMyAsset.useMutation();

	async function onDelete() {
		const confirmed = window.confirm(`Datei "${asset.fileName}" wirklich löschen?`);
		if (!confirmed) return;

		try {
			await removeFromStorageServer(asset);

			showToast({
				type: "success",
				title: "Datei erfolgreich gelöscht",
				subtitle: asset.fileName
			});
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({
					type: "error",
					title: "Datei konnte nicht gelöscht werden",
					subtitle: error.message
				});
			}
		}
	}

	return (
		<Menu as="div" className="relative flex">
			<MenuButton className="rounded-full p-2 hover:bg-gray-50">
				<EllipsisVerticalIcon className="h-5 text-gray-400" />
			</MenuButton>
			<MenuItems className="absolute left-4 top-4 divide-y divide-gray-100 rounded-md bg-white object-left-top text-sm shadow-lg ring-1 ring-emerald-500 ring-opacity-5 focus:outline-none">
				<MenuItem as="div" className="p-1">
					{({ focus }) => (
						<button
							className={`${
								focus ? "bg-secondary text-white" : ""
							} flex w-full items-center gap-4 whitespace-nowrap rounded-md px-4 py-2 opacity-25`}
						>
							<PencilIcon className="h-5" />
							<span>Umbenennen (Nicht verfügbar)</span>
						</button>
					)}
				</MenuItem>
				<MenuItem as="div" className="p-1">
					{({ focus }) => (
						<button
							onClick={onDelete}
							className={`${
								focus ? "bg-secondary text-white" : "text-red-500"
							} flex w-full items-center gap-4 whitespace-nowrap rounded-md px-4 py-2`}
						>
							<TrashIcon className="h-5" />
							<span>Löschen</span>
						</button>
					)}
				</MenuItem>
			</MenuItems>
		</Menu>
	);
}
