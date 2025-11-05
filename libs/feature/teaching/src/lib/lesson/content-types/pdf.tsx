import { PDF } from "@self-learning/types";
import { SectionCard } from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { PdfViewer } from "@self-learning/ui/lesson";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export function PdfInput({ index }: { index: number }) {
	const { control } = useFormContext<{ content: PDF[] }>();
	const { update } = useFieldArray<{ content: PDF[] }>({
		name: "content"
	});

	const {
		value: { url }
	} = useWatch({ control, name: `content.${index}` });

	return (
		<SectionCard>
			<h3 className="text-xl mb-2">PDF</h3>

			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-4 md:flex-row">
						<LabeledField label="URL">
							<input
								type={"text"}
								className="textfield w-full"
								value={url}
								onChange={e =>
									update(index, {
										type: "pdf",
										value: { url: e.target.value },
										meta: {
											estimatedDuration: 0
										}
									})
								}
							/>
						</LabeledField>
					</div>

					<Upload
						key={"pdf"}
						mediaType="pdf"
						preview={
							<div className="overflow-hidden bg-gray-200">
								{url && (
									<div className="h-[500px] overflow-auto bg-white">
										<PdfViewer url={url} />
									</div>
								)}
							</div>
						}
						onUploadCompleted={(publicUrl, meta) => {
							update(index, {
								type: "pdf",
								value: { url: publicUrl },
								meta: { estimatedDuration: meta?.duration ?? 0 }
							});
						}}
					/>
				</div>
			</div>
		</SectionCard>
	);
}
