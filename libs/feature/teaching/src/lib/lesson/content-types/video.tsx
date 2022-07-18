import { Video } from "@self-learning/types";
import { SectionCard, SectionCardHeader } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useFieldArray, useFormContext } from "react-hook-form";
import { VideoUploadWidget } from "../../image-upload";
import { getSupabaseUrl } from "../../supabase";

export function VideoInput({ index, remove }: { index: number; remove: () => void }) {
	const { register, watch } = useFormContext<{ content: Video[] }>();
	const { update } = useFieldArray<{ content: Video[] }>({
		name: "content"
	});

	const url = watch(`content.${index}.value.url`);

	return (
		<CenteredContainer className="w-full">
			<SectionCard>
				<SectionCardHeader
					title="Video"
					subtitle="Verlinke ein Video oder lade ein neues Video hoch."
				/>

				<div className="flex flex-col gap-8">
					<LabeledField label="URL">
						<input
							{...register(`content.${index}.value.url`)}
							placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
						/>
					</LabeledField>

					<LabeledField label="Länge">
						<input
							{...register(`content.${index}.meta.duration`)}
							placeholder="Länge des Videos in Sekunden."
						/>
					</LabeledField>

					<VideoUploadWidget
						url={url ?? null}
						onUrlChange={url =>
							update(index, {
								type: "video",
								value: { url },
								meta: { duration: 0 }
							})
						}
						onUpload={file => {
							console.log(file);

							const { publicURL, error } = getSupabaseUrl("videos", file.filepath);
							if (!error) {
								update(index, {
									type: "video",
									value: { url: publicURL as string },
									meta: { duration: file.duration }
								});
							}
						}}
					/>
					<button
						type="button"
						className="absolute top-8 right-8 w-fit self-end text-sm text-red-500"
						onClick={remove}
					>
						Entfernen
					</button>
				</div>
			</SectionCard>
		</CenteredContainer>
	);
}
