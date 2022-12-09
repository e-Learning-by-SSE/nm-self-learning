import { Menu } from "@headlessui/react";
import { CloudDownloadIcon } from "@heroicons/react/outline";
import { DotsVerticalIcon, PencilIcon, TrashIcon } from "@heroicons/react/solid";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { formatDateAgo } from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import { inferProcedureOutput, inferRouterOutputs } from "@trpc/server";
import { parseISO } from "date-fns";
import { ReactElement, useId, useMemo, useState } from "react";
import { SearchField } from "./searchfield";

type MediaType = "image" | "video" | "pdf";

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
	const trpcContext = trpc.useContext();

	const accept = useMemo(() => {
		const mediaTypes = {
			image: "image/*",
			video: "video/*",
			pdf: "application/pdf"
		};

		let accept: string | undefined = undefined;

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

		const { presignedUrl, publicUrl } = await getPresignedUrl({ filename: objectName });
		console.log("Presigned URL:", presignedUrl);

		await uploadFile(file, presignedUrl);
		console.log("File uploaded to:", publicUrl);
		onUploadCompleted(publicUrl, meta);

		try {
			await registerAsset({ objectName, publicUrl, fileType, fileName });
			console.log("Asset registered.");
			trpcContext.storage.invalidate();
		} catch (error) {
			console.log("Failed to register asset.");
			console.error(error);
		}
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

function tryGetMediaType(file: File): string | null {
	const [type, extension] = file.type.split("/");

	if (type === "image" || type === "video") {
		return type;
	} else if (extension === "pdf") {
		return "pdf";
	}

	return null;
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

export function AssetPickerButton({
	onClose,
	mediaType,
	copyToClipboard
}: Parameters<typeof AssetPickerDialog>[0]) {
	const [showAssetPicker, setShowAssetPicker] = useState(false);

	return (
		<button
			type="button"
			className="h-fit rounded-lg border border-light-border bg-white px-2 py-2"
			title="Aus hochgeladenen Dateien auswählen"
			onClick={() => setShowAssetPicker(true)}
		>
			<CloudDownloadIcon className="h-5" />

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

type Asset = inferRouterOutputs<AppRouter>["storage"]["getMyAssets"][0];

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
	const { data: assets, isLoading } = trpc.storage.getMyAssets.useQuery();

	const [filter, setFilter] = useState("");

	const filteredAssets = useMemo(() => {
		if (!assets) {
			return [];
		}

		const trimmedFilter = filter.trim();

		if (trimmedFilter.length === 0) {
			return assets;
		}

		return assets.filter(
			asset => asset.fileName.toLowerCase().includes(trimmedFilter.toLowerCase()) // Filter by filename
		);
	}, [assets, filter]);

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
						{isLoading ? (
							<LoadingBox height={256} />
						) : filteredAssets.length === 0 ? (
							<span className="text-sm text-light">Keine Dateien gefunden.</span>
						) : (
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
											<span
												title={parseISO(asset.createdAt).toLocaleString()}
											>
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
						)}
					</ul>
				</div>

				<DialogActions onClose={onClose}></DialogActions>
			</div>
		</Dialog>
	);
}

function AssetOptionsMenu({ asset }: { asset: Asset }) {
	const trpcContext = trpc.useContext();
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
		} finally {
			trpcContext.storage.invalidate();
		}
	}

	return (
		<Menu as="div" className="relative flex">
			<Menu.Button className="rounded-full p-2 hover:bg-gray-50">
				<DotsVerticalIcon className="h-5 text-gray-400" />
			</Menu.Button>
			<Menu.Items className="absolute left-4 top-4 divide-y divide-gray-100 rounded-md bg-white object-left-top text-sm shadow-lg ring-1 ring-emerald-500 ring-opacity-5 focus:outline-none">
				<Menu.Item as="div" className="p-1">
					{({ active }) => (
						<button
							className={`${
								active ? "bg-secondary text-white" : ""
							} flex w-full items-center gap-4 whitespace-nowrap rounded-md px-4 py-2 opacity-25`}
						>
							<PencilIcon className="h-5" />
							<span>Umbenennen (Nicht verfügbar)</span>
						</button>
					)}
				</Menu.Item>
				<Menu.Item as="div" className="p-1">
					{({ active }) => (
						<button
							onClick={onDelete}
							className={`${
								active ? "bg-secondary text-white" : "text-red-500"
							} flex w-full items-center gap-4 whitespace-nowrap rounded-md px-4 py-2`}
						>
							<TrashIcon className="h-5" />
							<span>Löschen</span>
						</button>
					)}
				</Menu.Item>
			</Menu.Items>
		</Menu>
	);
}
