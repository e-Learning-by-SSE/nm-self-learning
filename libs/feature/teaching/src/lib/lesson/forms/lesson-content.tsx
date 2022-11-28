import { DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { LessonContent, LessonContentType, ValueByContentType } from "@self-learning/types";
import { RemovableTab, SectionHeader, Tabs } from "@self-learning/ui/common";
import { Reorder } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { ArticleInput } from "../content-types/article";
import { PdfInput } from "../content-types/pdf";
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
			article: false,
			pdf: false
		};

		for (const c of content) {
			allTypes[c.type] = true;
		}

		return allTypes;
	}, [content]);

	return typesWithUsage;
}

export function useLessonContentEditor(control: Control<{ content: LessonContent }>) {
	const {
		append,
		remove,
		replace: setContent,
		fields: content
	} = useFieldArray<{ content: LessonContent }>({
		name: "content",
		control
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

	const typesWithUsage = useContentTypeUsage(content);

	function addContent(type: LessonContentType["type"]) {
		const addActions: { [contentType in LessonContentType["type"]]: () => void } = {
			video: () => append({ type: "video", value: { url: "" }, meta: { duration: 0 } }),
			article: () =>
				append({ type: "article", value: { content: "" }, meta: { estimatedDuration: 0 } }),
			pdf: () =>
				append({
					type: "pdf",
					value: { url: "" },
					meta: { estimatedDuration: 0 }
				})
		};

		const fn = addActions[type];

		if (!fn) {
			throw new Error(
				`Unknown content type: ${type} - There is no action defined to add this type.`
			);
		}

		fn();

		setContentTabIndex(content.length); // Select the newly created tab
	}

	const removeContent = useCallback(
		(index: number) => {
			const confirmed = window.confirm("Inhalt entfernen ?");

			if (confirmed) {
				remove(index);
			}
		},
		[remove]
	);

	return {
		content,
		addContent,
		removeContent,
		setContent,
		contentTabIndex,
		typesWithUsage,
		setContentTabIndex
	};
}

export function LessonContentEditor() {
	const { control } = useFormContext<{ content: LessonContent }>();
	const {
		content,
		addContent,
		removeContent,
		setContent,
		contentTabIndex,
		setContentTabIndex,
		typesWithUsage
	} = useLessonContentEditor(control);

	return (
		<section>
			<SectionHeader
				title="Inhalt"
				subtitle="Inhalt, der zur Wissensvermittlung genutzt werden soll. Wenn mehrere Elemente
					angelegt werden, kann der Student selber entscheiden, welches Medium angezeigt
					werden soll."
			/>

			<div className="flex gap-4 text-sm">
				<button
					type="button"
					className="btn-primary w-fit"
					onClick={() => addContent("video")}
					disabled={typesWithUsage["video"]}
				>
					<VideoCameraIcon className="h-5" />
					<span>Video hinzufügen</span>
				</button>

				<button
					type="button"
					className="btn-primary w-fit"
					onClick={() => addContent("article")}
					disabled={typesWithUsage["article"]}
				>
					<DocumentTextIcon className="h-5" />
					<span>Artikel hinzufügen</span>
				</button>

				<button
					type="button"
					className="btn-primary w-fit"
					onClick={() => addContent("pdf")}
					disabled={typesWithUsage["pdf"]}
				>
					<DocumentTextIcon className="h-5" />
					<span>PDF hinzufügen</span>
				</button>
			</div>

			<div className="mb-8 mt-4 flex gap-4">
				{content.length > 0 && (
					<Reorder.Group
						className="w-full"
						axis="x"
						values={content}
						onReorder={setContent}
					>
						<Tabs selectedIndex={contentTabIndex} onChange={setContentTabIndex}>
							{content.map((value, index) => (
								<Reorder.Item as="div" key={value.id} value={value}>
									<RemovableTab onRemove={() => removeContent(index)}>
										{value.type}
									</RemovableTab>
								</Reorder.Item>
							))}
						</Tabs>
					</Reorder.Group>
				)}
			</div>

			{contentTabIndex !== undefined && content[contentTabIndex] ? (
				<RenderContentType index={contentTabIndex} content={content[contentTabIndex]} />
			) : (
				<div className="rounded-lg border border-light-border bg-white py-80 text-center text-light">
					Diese Lerneinheit hat noch keinen Inhalt.
				</div>
			)}
		</section>
	);
}

function RenderContentType({ index, content }: { index: number; content: LessonContentType }) {
	if (content.type === "video") {
		return <VideoInput index={index} />;
	}

	if (content.type === "article") {
		return <ArticleInput index={index} />;
	}

	if (content.type === "pdf") {
		return <PdfInput index={index} />;
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}
