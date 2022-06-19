import { Video } from "@self-learning/types";
import { SectionCard, SectionCardHeader } from "@self-learning/ui/common";
import { Textfield } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { VideoUploadWidget } from "../../image-upload";
import { getSupabaseUrl } from "../../supabase";
import { SetValueFn } from "../lesson-content";

export function VideoInput({
	index,
	video,
	setValue,
	remove
}: {
	index: number;
	video: Video;
	setValue: SetValueFn;
	remove: () => void;
}) {
	return (
		<CenteredContainer className="w-full">
			<SectionCard>
				<SectionCardHeader
					title="Video"
					subtitle="Verlinke ein Video oder lade ein neues Video hoch."
				/>

				<div className="flex flex-col gap-8">
					<Textfield
						name="url"
						label="URL"
						required={true}
						value={video.value.url}
						onChange={event => setValue("video", { url: event.target.value }, index)}
						placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
					/>

					<VideoUploadWidget
						url={video.value.url as string}
						onUpload={filepath => {
							console.log(filepath);

							const { publicURL, error } = getSupabaseUrl("videos", filepath);
							if (!error) {
								setValue("video", { url: publicURL as string }, index);
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
