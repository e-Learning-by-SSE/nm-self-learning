export type LessonContent = LessonContentType[];
export type LessonContentType = Video | Article;
export type LessonContentMediaType = LessonContentType["type"];

export type Video = { type: "video"; value: { url?: string } };
export type Article = { type: "article"; value: { content?: string } };

type InferContentType<
	CType extends LessonContentType["type"],
	Union = LessonContentType
> = Union extends {
	type: CType;
}
	? Union
	: never;

export type ValueByContentType<CType extends LessonContentType["type"]> =
	InferContentType<CType>["value"];

export function findContentType<CType extends LessonContentType["type"]>(
	type: CType,
	content: LessonContent
): { content: InferContentType<CType> | null; index: number } {
	const index = content.findIndex(c => c.type === type);

	if (index >= 0) {
		return { content: content[index] as InferContentType<CType>, index };
	}

	return { content: null, index };
}
