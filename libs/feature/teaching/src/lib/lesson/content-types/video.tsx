import { Video } from "@self-learning/types";
import { SectionCard } from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { VideoPlayer } from "@self-learning/ui/lesson";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export function VideoInput({ index }: { index: number }) {
	const { control } = useFormContext<{ content: Video[] }>();
	const { update } = useFieldArray<{ content: Video[] }>({
		name: "content"
	});

	const {
		value: { url }
	} = useWatch({ control, name: `content.${index}` });

	return (
		<SectionCard>
			<h3 className="text-xl mb-2">Video</h3>

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
										type: "video",
										value: { url: e.target.value },
										meta: { duration: 0 }
									})
								}
							/>
						</LabeledField>
					</div>

					<Upload
						key={"video"}
						mediaType="video"
						preview={
							<div className="aspect-video w-full bg-black">
								{url && <VideoPlayer url={url} />}
							</div>
						}
						onUploadCompleted={(publicUrl, meta) => {
							console.log("has changed video", publicUrl, meta);

							update(index, {
								type: "video",
								value: { url: publicUrl },
								meta: { duration: meta?.duration ?? 0 }
							});
						}}
					/>
				</div>
			</div>
		</SectionCard>
	);
}
