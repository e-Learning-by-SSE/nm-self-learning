import { Video } from "@self-learning/types";
import { SectionCard } from "@self-learning/ui/common";
import { GenerateSubtile, LabeledField, ModifySubtile, Upload } from "@self-learning/ui/forms";
import { VideoPlayer, VideoPlayerHandle } from "@self-learning/ui/lesson";
import { useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export function VideoInput({ index }: { index: number }) {
	const { control } = useFormContext<{ content: Video[] }>();
	const { update } = useFieldArray<{ content: Video[] }>({
		name: "content"
	});
	const { watch } = useFormContext<{ lessonId: string }>();
	const reactPlayer = useRef<VideoPlayerHandle | null>(null);

	const {
		value: { url, subtitle },
		meta: { duration }
	} = useWatch({ control, name: `content.${index}` });
	const transcriptionServiceUrl = process.env.NEXT_PUBLIC_TRANSCRIPTION_SERVICE_URL;

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
								{url && (
									<VideoPlayer url={url} subtitle={subtitle} ref={reactPlayer} />
								)}
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
					{url && subtitle && (
						<div className="max-h-64 overflow-y-auto">
							<ModifySubtile
								subtitle={subtitle}
								onClick={seconds => {
									console.log(
										"Seeking to",
										seconds,
										"Player ref:",
										reactPlayer.current
									);
									if (reactPlayer.current) {
										reactPlayer.current.setCurrentTime(seconds);
									}
								}}
								onChange={newSubtitle => {
									update(index, {
										type: "video",
										value: { url, subtitle: newSubtitle },
										meta: { duration }
									});
								}}
							/>
						</div>
					)}
					{url && !subtitle && transcriptionServiceUrl && (
						<GenerateSubtile
							video_url={url}
							lessonId={watch().lessonId}
							onTranscriptionCompleted={createdSubtitle => {
								update(index, {
									type: "video",
									value: { url, subtitle: createdSubtitle },
									meta: { duration }
								});
							}}
						/>
					)}
				</div>
			</div>
		</SectionCard>
	);
}
