import { DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { LessonContent, LessonContentType, ValueByContentType } from "@self-learning/types";
import { SectionHeader } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { ArticleInput } from "../content-types/article";
import { VideoInput } from "../content-types/video";

export type SetValueFn = <CType extends LessonContentType["type"]>(
	type: CType,
	value: ValueByContentType<CType> | undefined,
	index: number
) => void;

function useContentTypeUsage(content: LessonContent) {
	const typesWithUsage = useMemo(() => {
		const allTypes: { [contentType in LessonContentType["type"]]: boolean } = {
			video: false,
			article: false
		};

		for (const c of content) {
			allTypes[c.type] = true;
		}

		return allTypes;
	}, [content]);

	return typesWithUsage;
}

export function LessonContentEditor() {
	const {
		append,
		remove,
		fields: content
	} = useFieldArray<{ content: LessonContent }>({
		name: "content"
	});

	const [contentTabIndex, setContentTabIndex] = useState<number | undefined>(
		content.length > 0 ? 0 : undefined
	);

	useEffect(() => {
		if (content.length === 0) {
			setContentTabIndex(undefined);
		}

		if (contentTabIndex && contentTabIndex >= content.length) {
			setContentTabIndex(content.length > 0 ? 0 : undefined);
		}
	}, [contentTabIndex, content]);

	const typesWithUsage = useContentTypeUsage([]);

	function addContent(type: LessonContentType["type"]) {
		let initialValue: LessonContentType["value"] = {};

		if (type === "article") {
			initialValue = { content: "" };
		}

		if (type === "video") {
			initialValue = { url: "" };
		}

		append({ type, value: initialValue } as any);
		setContentTabIndex(content.length);
	}

	const onRemove = useCallback(
		(index: number) => {
			const confirmed = window.confirm("Inhalt entfernen ?");

			if (confirmed) {
				remove(index);
			}
		},
		[remove]
	);

	return (
		<section>
			<CenteredContainer className="mb-4 flex flex-col">
				<SectionHeader
					title="Inhalt"
					subtitle="Inhalt, der zur Wissensvermittlung genutzt werden soll. Wenn mehrere Elemente
					angelegt werden, kann der Student selber entscheiden, welches Medium angezeigt
					werden soll."
				/>

				<div className="flex gap-4">
					{!typesWithUsage["video"] && (
						<button
							type="button"
							className="btn-primary w-fit"
							onClick={() => addContent("video")}
						>
							<VideoCameraIcon className="h-5" />
							<span>Video hinzufügen</span>
						</button>
					)}

					{!typesWithUsage["article"] && (
						<button
							type="button"
							className="btn-primary w-fit"
							onClick={() => addContent("article")}
						>
							<DocumentTextIcon className="h-5" />
							<span>Artikel hinzufügen</span>
						</button>
					)}
				</div>

				<div className="mt-8 flex gap-4">
					{content.length > 0 && (
						<>
							{content.map((record, index) => (
								<button
									type="button"
									onClick={() => setContentTabIndex(index)}
									className={`border-b-2 px-2 pb-1 ${
										index === contentTabIndex
											? "border-b-secondary font-semibold text-secondary"
											: "border-b-transparent text-light"
									}`}
									key={record.id}
								>
									{record.type}
								</button>
							))}
						</>
					)}
				</div>
			</CenteredContainer>

			{contentTabIndex !== undefined && content[contentTabIndex] ? (
				<RenderContentType
					index={contentTabIndex}
					content={content[contentTabIndex]}
					onRemove={onRemove}
				/>
			) : (
				<CenteredContainer>
					<div className="rounded-lg border border-light-border bg-white py-80 text-center text-light">
						Diese Lerneinheit hat noch keinen Inhalt.
					</div>
				</CenteredContainer>
			)}
		</section>
	);
}

function RenderContentType({
	index,
	content,
	onRemove
}: {
	index: number;
	content: LessonContentType;
	onRemove: (index: number) => void;
}) {
	if (content.type === "video") {
		return <VideoInput index={index} remove={() => onRemove(index)} />;
	}

	if (content.type === "article") {
		return <ArticleInput index={index} onRemove={() => onRemove(index)} />;
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}
