import { PlusIcon } from "@heroicons/react/24/solid";
import { LessonFormModel } from "@self-learning/teaching";
import {
	getContentTypeDisplayName,
	LessonContent,
	LessonContentMediaType,
	LessonContentType,
	ValueByContentType
} from "@self-learning/types";
import { RemovableTab, SectionHeader, Tabs, useIsFirstRender } from "@self-learning/ui/common";
import { Form, LabeledField, MarkdownField } from "@self-learning/ui/forms";
import { Reorder } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Control, Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ArticleInput } from "../content-types/article";
import { IFrameInput } from "../content-types/iframe";
import { PdfInput } from "../content-types/pdf";
import { VideoInput } from "../content-types/video";

export type SetValueFn = <CType extends LessonContentType["type"]>(
	type: CType,
	value: ValueByContentType<CType> | undefined,
	index: number
) => void;

function useContentTypeUsage(content: LessonContent) {
	const typesWithUsage = useMemo(() => {
		const possibleTypes: { [contentType in LessonContentType["type"]]?: boolean } = {};

		for (const c of content) {
			possibleTypes[c.type] = true;
		}

		return possibleTypes;
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
				}),
			iframe: () =>
				append({
					type: "iframe",
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

const contentTypes: LessonContentMediaType[] = ["video", "article", "pdf", "iframe"];

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
			<div className="mb-8">
				<LessonDescriptionForm />
			</div>
			<SectionHeader
				title="Inhalt"
				subtitle="Inhalt, der zur Wissensvermittlung genutzt werden soll. Wenn mehrere Elemente
					angelegt werden, kann der Student selber entscheiden, welches Medium angezeigt
					werden soll."
			/>

			<div className="flex gap-4 text-sm">
				{contentTypes.map(contentType => (
					<AddButton
						key={contentType}
						contentType={contentType}
						disabled={typesWithUsage[contentType] === true}
						addContent={addContent}
					/>
				))}
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
										{getContentTypeDisplayName(value.type)}
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

function AddButton({
	contentType,
	addContent,
	disabled
}: {
	contentType: LessonContentMediaType;
	addContent: (t: LessonContentMediaType) => void;
	disabled: boolean;
}) {
	return (
		<button
			type="button"
			className="btn-primary w-fit"
			onClick={() => addContent(contentType)}
			disabled={disabled}
		>
			<PlusIcon className="icon h-5" />
			<span>{getContentTypeDisplayName(contentType)} hinzufügen</span>
		</button>
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

	if (content.type === "iframe") {
		return <IFrameInput index={index} />;
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}

export function LessonDescriptionForm() {
	const form = useFormContext<LessonFormModel>();
	const control = form.control;
	const currentLessonType = form.watch("lessonType");
	const suppressHighlight = useIsFirstRender();

	return (
		<section>
			<div className="py-4">
				{currentLessonType === "SELF_REGULATED" && (
					<div
						data-testid="aktivierungsfrage-element"
						className={`p-4 rounded-md ${!suppressHighlight ? "animate-highlight" : ""}`}
					>
						<LabeledField label="Aktivierungsfrage" optional={false}>
							<Controller
								control={control}
								name="selfRegulatedQuestion"
								render={({ field }) => (
									<MarkdownField
										content={field.value as string}
										setValue={field.onChange}
									/>
								)}
							/>
						</LabeledField>
					</div>
				)}
			</div>
			<SectionHeader
				title="Beschreibung"
				subtitle="Ausführliche Beschreibung dieser Lerneinheit. Unterstützt Markdown."
			/>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<MarkdownField content={field.value as string} setValue={field.onChange} />
					)}
				/>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
