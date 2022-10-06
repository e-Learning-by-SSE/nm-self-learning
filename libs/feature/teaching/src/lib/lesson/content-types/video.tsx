import { Video } from "@self-learning/types";
import { SectionCard, SectionCardHeader } from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { VideoPlayer } from "@self-learning/ui/lesson";
import { formatSeconds } from "@self-learning/util/common";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export function VideoInput({ index, remove }: { index: number; remove: () => void }) {
	const { control, register } = useFormContext<{ content: Video[] }>();
	const { update } = useFieldArray<{ content: Video[] }>({
		name: "content"
	});

	const {
		value: { url },
		meta: { duration }
	} = useWatch({ control, name: `content.${index}` });

	return (
		<CenteredContainer className="w-full">
			<SectionCard>
				<SectionCardHeader
					title="Video"
					subtitle="Verlinke ein Video oder lade ein neues Video hoch."
				/>

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

							<LabeledField label="Länge in Sekunden">
								<div className="flex">
									<input
										className="textfield w-full"
										type={"number"}
										placeholder="Länge des Videos in Sekunden"
										value={duration}
										onChange={e =>
											update(index, {
												type: "video",
												value: { url },
												meta: { duration: e.target.valueAsNumber }
											})
										}
									/>
									<span className="my-auto w-fit px-2 text-sm text-light">
										{formatSeconds(duration)}
									</span>
								</div>
							</LabeledField>
						</div>

						<Upload
							mediaType="video"
							preview={
								<div className="aspect-video w-full bg-black">
									{url && <VideoPlayer url={url} />}
								</div>
							}
							onUploadCompleted={(publicUrl, meta) => {
								update(index, {
									type: "video",
									value: { url: publicUrl },
									meta: { duration: meta?.duration ?? 0 }
								});
							}}
						/>
					</div>

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
