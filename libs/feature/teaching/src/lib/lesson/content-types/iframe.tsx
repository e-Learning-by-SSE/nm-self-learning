import { trpc } from "@self-learning/api-client";
import { getContentTypeDisplayName, IFrame } from "@self-learning/types";
import { SectionCard } from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export function IFrameInput({ index }: { index: number }) {
	const { control } = useFormContext<{ content: IFrame[] }>();
	const { update } = useFieldArray<{ content: IFrame[] }>({
		name: "content"
	});

	const content = useWatch({ control, name: `content.${index}` });
	const { url, source, originalFileName } = content.value;

	const [activeTab, setActiveTab] = useState<"url" | "upload">(
		!source || source !== "url" ? "upload" : "url"
	);

	const { mutateAsync: unpackArchive, isPending: isUnpacking } =
		trpc.storage.unpackArchive.useMutation();

	const [uploadError, setUploadError] = useState<string | null>(null);

	async function handleArchiveUploaded(
		downloadUrl: string,
		fileName: string,
		kind: "zip" | "h5p"
	) {
		setUploadError(null);
		try {
			const objectName = downloadUrl.split("/").pop() ?? "";
			const result = await unpackArchive({ objectName, kind });

			const viewerUrl =
				kind === "h5p" ? result.folderUrl : `${result.folderUrl}/${result.entryPoint}`;

			update(index, {
				type: "iframe",
				value: {
					url: viewerUrl,
					source: kind,
					entryPoint: result.entryPoint,
					originalFileName: fileName,
					folderObjectName: result.folderObjectName
				},
				meta: { estimatedDuration: 0 }
			});
		} catch (err) {
			setUploadError((err as Error).message ?? "Failed to unpack archive.");
		}
	}

	return (
		<SectionCard>
			<h3 className="text-xl mb-2">{getContentTypeDisplayName("iframe")}</h3>

			{/* Tab switcher */}
			<div className="flex gap-2 mb-4 border-b border-light-border">
				<button
					type="button"
					onClick={() => setActiveTab("upload")}
					className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
						activeTab === "upload"
							? "border-primary text-primary"
							: "border-transparent text-c-text-muted hover:text-c-text"
					}`}
				>
					Datei hochladen
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("url")}
					className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
						activeTab === "url"
							? "border-primary text-primary"
							: "border-transparent text-c-text-muted hover:text-c-text"
					}`}
				>
					Externe URL
				</button>
			</div>

			<div className="flex flex-col gap-4">
				{activeTab === "url" && (
					<>
						<span className="text-c-text-muted text-sm">
							Hinweis: Nicht alle Webseiten erlauben das Einbetten von iFrames.
						</span>
						<LabeledField label="URL">
							<input
								type="text"
								className="textfield w-full"
								value={source && source !== "url" ? "" : url}
								placeholder="https://example.com"
								onChange={e =>
									update(index, {
										type: "iframe",
										value: { url: e.target.value, source: "url" },
										meta: { estimatedDuration: 0 }
									})
								}
							/>
						</LabeledField>
						{url && (!source || source === "url") && (
							<iframe
								src={url}
								title="iframe"
								width="100%"
								height="500px"
								sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
							/>
						)}
					</>
				)}

				{activeTab === "upload" && (
					<>
						<span className="text-c-text-muted text-sm">
							Unterstützte Formate: einzelne HTML-Datei, ZIP-Archiv (mit index.html),
							H5P-Datei (.h5p)
						</span>

						{originalFileName && (
							<div className="text-sm text-c-text-muted">
								Aktuell hochgeladen:{" "}
								<span className="font-medium text-c-text">{originalFileName}</span>
							</div>
						)}

						{uploadError && (
							<div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
								{uploadError}
							</div>
						)}

						{isUnpacking && (
							<div className="text-sm text-c-text-muted animate-pulse">
								Archiv wird entpackt und hochgeladen...
							</div>
						)}

						<Upload
							key="html-upload"
							mediaType="zip"
							onUploadCompleted={(downloadUrl, _meta, fileName) => {
								console.log("downloadUrl:", downloadUrl, "fileName:", fileName);
								const name = (fileName ?? "").toLowerCase();

								// Single HTML files don't need unpacking — use URL directly
								if (name.endsWith(".html") || name.endsWith(".htm")) {
									update(index, {
										type: "iframe",
										value: {
											url: downloadUrl,
											source: "html",
											originalFileName: fileName ?? ""
										},
										meta: { estimatedDuration: 0 }
									});
									return;
								}

								// ZIP and H5P need server-side unpacking
								const kind = name.endsWith(".h5p") ? "h5p" : "zip";
								handleArchiveUploaded(downloadUrl, fileName ?? "", kind);
							}}
							preview={
								url && source && source !== "url" ? (
									<div className="h-[500px] w-full overflow-hidden rounded border border-light-border">
										<iframe
											key={url}
											src={url}
											title="HTML5 Viewer"
											width="100%"
											height="100%"
											sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
										/>
									</div>
								) : (
									<div className="h-[500px] w-full bg-c-surface-3 rounded" />
								)
							}
						/>
					</>
				)}
			</div>
		</SectionCard>
	);
}
