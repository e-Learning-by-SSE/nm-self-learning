import { DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { LessonContent, LessonContentType, ValueByContentType } from "@self-learning/types";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { ArticleInput } from "./content-types/article";
import { VideoInput } from "./content-types/video";

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

export function LessonContentEditor({
	content,
	setContent
}: {
	content: LessonContentType[];
	setContent: Dispatch<SetStateAction<LessonContentType[]>>;
}) {
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

	const typesWithUsage = useContentTypeUsage(content);

	function addContent(type: LessonContentType["type"]) {
		let initialValue: LessonContentType["value"];

		if (type === "article") {
			initialValue = { content: "" };
		}

		if (type === "video") {
			initialValue = { url: "" };
		}

		setContent(prev => [
			...prev,
			{
				type,
				value: initialValue as any
			}
		]);

		setContentTabIndex(content.length);
	}

	const onRemove = useCallback(
		(index: number) => {
			const confirmed = window.confirm("Inhalt entfernen ?");

			if (confirmed) {
				setContent(prev => prev.filter((item, i) => index !== i));
			}
		},
		[setContent]
	);

	function setValue(type: string, value: unknown, index: number) {
		if (index >= 0 && index < content.length) {
			const copy = [...content];
			(copy[index] as { value: unknown }).value = value;
			setContent(copy);
		}
	}

	if (contentTabIndex) {
		console.log(content[contentTabIndex]);
	}

	return (
		<div className="bg-gray-50">
			<CenteredContainer className="flex flex-col gap-8 pb-8">
				<h2 className="text-4xl">Inhalt</h2>
				<p className="text-light">
					Inhalt, der zur Wissensvermittlung genutzt werden soll. Wenn mehrere Elemente
					angelegt werden, kann der Student selber entscheiden, welches Medium angezeigt
					werden soll.
				</p>

				<div className="flex gap-4">
					<button
						className="flex place-content-center place-items-center gap-2 rounded-lg bg-emerald-500 px-8 py-2 font-semibold text-white disabled:opacity-50"
						onClick={() => addContent("video")}
						disabled={typesWithUsage["video"]}
					>
						<VideoCameraIcon className="h-5" />
						<span>Video</span>
					</button>

					<button
						className="flex place-content-center place-items-center gap-2 rounded-lg bg-blue-500 px-8 py-2 font-semibold text-white disabled:opacity-50"
						onClick={() => addContent("article")}
						disabled={typesWithUsage["article"]}
					>
						<DocumentTextIcon className="h-5" />
						<span>Artikel</span>
					</button>
				</div>

				<div className="flex gap-4">
					{content.length > 0 && (
						<>
							{content.map((c, index) => (
								<button
									onClick={() => setContentTabIndex(index)}
									className={`border-b-2 px-2 pb-1 ${
										index === contentTabIndex
											? "border-b-secondary font-semibold text-secondary"
											: "border-b-transparent text-light"
									}`}
									key={c.type}
								>
									{c.type}
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
					setValue={setValue}
				/>
			) : (
				<CenteredContainer>
					<div className="rounded-lg border border-light-border bg-white py-80 text-center text-light">
						Diese Lerneinheit hat noch keinen Inhalt.
					</div>
				</CenteredContainer>
			)}
		</div>
	);
}

function RenderContentType({
	index,
	content,
	onRemove,
	setValue
}: {
	index: number;
	content: LessonContentType;
	setValue: SetValueFn;
	onRemove: (index: number) => void;
}) {
	if (content.type === "video") {
		return (
			<VideoInput
				index={index}
				video={content}
				setValue={setValue}
				remove={() => onRemove(index)}
			/>
		);
	}

	if (content.type === "article") {
		return (
			<ArticleInput
				index={index}
				article={content}
				setValue={setValue}
				onRemove={() => onRemove(index)}
			/>
		);
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}
