import {
	toPlainText,
	markdownify as markdownifyDelegate,
	ExportFormat,
	liaScriptExport,
	IndentationLevels,
	selectNarrator,
	removeStorageUrls,
	parseIndent,
	MediaFileReplacement
} from "./liascript-api-utils";
import { FullCourseExport as CourseWithLessons } from "@self-learning/teaching";
import { LessonData as LessonExport } from "@self-learning/lesson";
import { Quiz } from "@self-learning/quiz";

import {
	CourseChapter,
	LessonContent,
	findContentType,
	LessonContentMediaType,
	getContentTypeDisplayName,
	LessonContentType
} from "@self-learning/types";
import { convertQuizzes } from "./question-utils";
import JSZip from "jszip";
import { downloadWithProgress, getFileSize } from "./network-utils";

export type ExportOptions = {
	addTitlePage?: boolean;
	language?: "en" | "de";
	narrator?: "female" | "male";
	considerTopics?: boolean;
	exportMailAddresses?: boolean;
	storagesToInclude?: string[];
	storageDestination?: string;
};

/**
 * Generates a zip file (markdown file + media files)that can be imported into LiaScript.
 * @param course The course to export (collection of lessons, data like title, ...)
 * @param lessons The NanoModules of the course (the media, quizzes, and data like title, description, ...)
 * @param signal An abort signal to allow aborting the download by the user. Created via AbortController.
 * @param onProgress A callback to inform about the progress (in percent: 0 .. 100)
 * @param onInfo A callback to inform about the current action (e.g. which file is currently downloaded)
 * @param exportOptions Options to consider
 * @returns A markdown string that can be used to write a LiaScript compatible markdown file.
 * @throws Error if a resource cannot be downloaded or the page is reloaded during action (will abort the stream unexpectedly)
 */
export async function exportCourseArchive(
	{ course, lessons }: CourseWithLessons,
	signal: AbortSignal,
	onProgress?: (percent: number) => void,
	onInfo?: (msg: string) => void,
	exportOptions?: ExportOptions
) {
	const options: ExportOptions = {
		storageDestination: `media/${course.slug}/`,
		...exportOptions
	};
	// Generate markdown file and create a zip archive with this file
	const { markdown, exportCandidates, incompleteExportedItems } = await exportCourse(
		{ course, lessons },
		options
	);
	const zip = new JSZip();
	zip.file(`${course.title}.md`, markdown);

	// Download all media files located on our storage server

	// Compute the total size of all media files
	const { sizePerFile, totalSize, downloadSize } =
		await computeEstimatedDownloadSize(exportCandidates);

	// Download all media files, add them to the zip archive, and report progress
	let alreadyLoaded = 0;
	for (const mediaFile of exportCandidates) {
		const estimatedFileSize = sizePerFile.get(mediaFile.source);
		onInfo && onInfo(`Downloade: ${mediaFile.source}`);

		// Call back used to report progress
		// Takes downloaded bytes of current file and computes overall progress
		const onProgressWrapper = (loaded: number) => {
			if (onProgress) {
				// For some reason (I expect network overhead) some files return a higher loaded value than the estimated file size.
				// To avoid progress > 100%, we take the minimum of both values.
				const maxFileSize = estimatedFileSize ?? loaded;
				const actuallyLoaded = Math.min(loaded, maxFileSize);

				const percentage = ((actuallyLoaded + alreadyLoaded) / totalSize) * 100;
				onProgress(percentage);
			}
		};
		const blob = await downloadWithProgress(mediaFile.source, signal, onProgressWrapper);

		alreadyLoaded += estimatedFileSize ?? 0;
		zip.file(mediaFile.destination, blob);
	}

	// 100 % of download completed, but not zipped yet, don't forget to add 10% for zipping
	onProgress && onProgress((downloadSize / totalSize) * 100);

	// Callback used to report progress of zipping
	const zipUpdateFn: JSZip.OnUpdateCallback = (metadata: {
		percent: number;
		currentFile: string | null;
	}) => {
		if (onInfo && metadata.currentFile) {
			onInfo(`Füge ${metadata.currentFile} dem Archiv hinzu.`);
		}

		// Compute overall progress (we assumed 10% overheads for zipping)
		const percentage = (((1 + metadata.percent / 1000) * downloadSize) / totalSize) * 100;
		onProgress && onProgress(percentage);
	};

	if (!signal.aborted) {
		// Create Zip archive and report progress
		const zipArchive = await zip.generateAsync({ type: "blob" }, zipUpdateFn);
		return { zipArchive, incompleteExportedItems };
	} else {
		throw new Error("Download aborted");
	}
}

/**
 * Computes the estimated total download size in Byte.
 * Required to compute the progress in percent.
 * Will also add additional overheads for zipping.
 * @param exportCandidates The media files to download
 * @returns sizePerFile A map of the estimated file sizes (in Byte) for each media file
 * @returns totalSize The estimated total download size (in Byte) including overheads for zipping
 * @returns downloadSize The estimated total download size (in Byte) excluding overheads for zipping.
 *
 * @example
 * Use the following code to indicate that download is completed, but not zipped yet:
 * ```
 * (downloadSize / totalSize) * 100
 * ```
 */
async function computeEstimatedDownloadSize(exportCandidates: MediaFileReplacement[]) {
	// Sie of all downloads in Bytes
	let downloadSize = 0;
	const sizePerFile = new Map<string, number>();
	for (const mediaFile of exportCandidates) {
		const size = await getFileSize(mediaFile.source);
		downloadSize += size;
		sizePerFile.set(mediaFile.source, size);
	}

	// Zipping takes also some time, we roughly estimate 10% overheads for this
	const totalSize = 1.1 * downloadSize;

	return { sizePerFile, totalSize, downloadSize };
}

/**
 * Generates a markdown file that can be imported into LiaScript.
 * @param param0 The course to export
 * @param exportOptions Options to consider
 * @returns A markdown string that can be used to write a LiaScript compatible markdown file.
 */
export async function exportCourseMarkdown(
	{ course, lessons }: CourseWithLessons,
	exportOptions?: ExportOptions
) {
	const { markdown } = await exportCourse({ course, lessons }, exportOptions);

	return markdown;
}

export type IncompleteNanoModuleExport = {
	nanomodule: {
		name: string;
		id: string;
		slug: string;
	};
	missedElements: MissedElement[];
};

/**
 * List of unsupported items (w.r.t reporting).
 * Extend this list if necessary.
 */
export type MissedElement =
	| IncompleteArticle
	| IncompleteProgrammingTask
	| IncompleteClozeText
	| IncompleteGeneralProgrammingTask
	| UnknownQuestionType;

export type IncompleteArticle = {
	type: "article";
	id: string;
	cause: string[];
};

export type IncompleteProgrammingTask = {
	type: "programming";
	id: string;
	index: number;
	cause: "unsupportedLanguage";
	language: string;
};

export type IncompleteGeneralProgrammingTask = {
	type: "programmingUnspecific";
	cause: "unsupportedSolution" | "hintsUnsupported";
};

export type IncompleteClozeText = {
	type: "clozeText";
	id: string;
	index: number;
	cause: "unsupportedAnswerType";
};

export type UnknownQuestionType = {
	type: "unknownQuestionType";
	id: string;
	index: number;
	questionType: string;
};

/**
 * Generates a markdown file that can be imported into LiaScript together with a list of extracted media files stored on our own storage.
 * @param param0 The course to export
 * @param exportOptions Options to consider
 * @returns A markdown string that can be used to write a LiaScript compatible markdown file.
 */
async function exportCourse({ course, lessons }: CourseWithLessons, exportOptions?: ExportOptions) {
	// Options for all (nested) export functions
	// Specifies default values, which may be overwritten by optional parameters
	const options: NonNullable<ExportOptions> = {
		addTitlePage: true,
		language: "de",
		narrator: "female",
		considerTopics: true,
		exportMailAddresses: true,
		storagesToInclude: [],
		storageDestination: `media/${course.slug}/`,
		...exportOptions
	};

	// List of media files, which were stored on our storage ans shall be exported (downloaded) as well
	const exportCandidates: MediaFileReplacement[] = [];

	// The JSON object that is used as input for the LiaScript API
	let courseDescription: string | undefined;
	if (course.description) {
		const { text, resources } = removeStorageUrls(toPlainText(course.description), {
			storageUrls: options.storagesToInclude,
			storageDestination: options.storageDestination
		});
		courseDescription = text;
		exportCandidates.push(...resources);
	}

	// Stores the list of items which could not exported completely
	// Will be altered by side effect of nested functions
	const incompleteExportedItems: IncompleteNanoModuleExport[] = [];

	const json: ExportFormat = {
		// The list of supported properties are documented here:
		// https://github.com/LiaScript/docs/blob/master/README.md#2-basic-macros
		meta: {
			title: course.title,
			author: course.authors.map(author => author.displayName).join(", "),
			...(options.exportMailAddresses && {
				email: course.authors.map(author => author.user.email).join(", ")
			}),
			date: new Date().toLocaleDateString(),
			version: "1.0",
			narrator: selectNarrator(options),
			...(courseDescription && { comment: courseDescription }),
			...(course.imgUrl && { logo: course.imgUrl })
		},
		sections: []
	};

	// The lessons of the course, accessible by their ID
	const lessonsMap = convertLessonsToMap(lessons);

	if (options.addTitlePage) {
		json.sections.push(addTitlePage());
	}

	for (const chapter of course.content as CourseChapter[]) {
		// Chapters are collections of lessons.
		const baseIndent = options.addTitlePage ? 2 : 1;
		json.sections.push(addSection(chapter, baseIndent));

		chapter.content.forEach(entry => {
			const lesson = lessonsMap.get(entry.lessonId);
			if (lesson) {
				const lessonIndent = parseIndent(baseIndent + 1);

				json.sections.push(addLessonOverviewPage(lesson, lessonIndent));

				const mediaType = ["video", "article", "pdf"];
				mediaType.forEach(type => {
					const contentBlock = findContentType(
						type as LessonContentMediaType,
						lesson.content as LessonContent
					);
					if (contentBlock.content) {
						json.sections.push(
							addLessonContent(
								contentBlock.content as LessonContentType,
								lessonIndent,
								type as LessonContentMediaType
							)
						);
					}
				});
				if (lesson.quiz) {
					json.sections.push(addLessonQuizzes(lesson, lessonIndent));
				}
			}
		});
	}

	const markdown = await liaScriptExport(json);
	return { markdown, exportCandidates, incompleteExportedItems };

	/**
	 * Checks if a given (optional) URL points to a file on our storage.
	 * If so, it adds it to the list of media files and returns the relative path.
	 * @param url A media URL (video, image, etc.) which may point to our storage.
	 * @returns A relative URL or the input URL if it does not point to our storage.
	 */
	function relativizeUrl(url?: string) {
		if (!url) return "";

		let relativeUrl = url;
		if (options.storagesToInclude && options.storagesToInclude.length > 0) {
			for (const storageUrl of options.storagesToInclude) {
				if (relativeUrl.startsWith(storageUrl)) {
					const source = relativeUrl;
					relativeUrl = relativeUrl.replace(storageUrl, options.storageDestination ?? "");
					exportCandidates.push({ source, destination: relativeUrl });
					break;
				}
			}
		}
		return relativeUrl;
	}

	/**
	 * Wraps the markdownify function of the liaScript API Utils to handle directly the extracted media files.
	 * This version of the function allows for custom unsupported item handling.
	 * @param input The Markdown formatted text to convert into LiaScript compatible markdown.
	 * @returns LiaScript compatible markdown.
	 */
	function markdownifyModifiedReport(
		input: string,
		onUnsupportedItem: (missedElement: MissedElement) => void
	) {
		const { markdown, resources } = markdownifyDelegate(input, onUnsupportedItem, {
			htmlTag: "section",
			removeLineNumbers: true,
			storageUrls: options.storagesToInclude,
			storageDestination: options.storageDestination
		});
		exportCandidates.push(...resources);

		return markdown;
	}

	/**
	 * Wraps the markdownify function of the liaScript API Utils to handle directly the extracted media files.
	 * @param input The Markdown formatted text to convert into LiaScript compatible markdown.
	 * @returns LiaScript compatible markdown.
	 */
	function markdownify(input: string) {
		const onUnsupportedItem = (missedElement: MissedElement) => {
			console.log("Unsupported item", missedElement);
		};

		return markdownifyModifiedReport(input, onUnsupportedItem);
	}

	/**
	 * Generates a title page for the course (indented by 1). This includes:
	 * - Title
	 * - Subtitle (optional)
	 * - Picture (optional)
	 * - Description (optional)
	 * - Subject (optional)
	 * - Specializations (optional)
	 */
	function addTitlePage() {
		const section = {
			title: course.title,
			indent: 1 as IndentationLevels,
			body: [] as string[]
		};

		// Support that subtile may become optional in future
		course.subtitle && section.body.push(markdownify(course.subtitle));
		// Add (optional) picture after subtitle before (optional) description
		if (course.imgUrl) {
			const imgUrl = relativizeUrl(course.imgUrl);
			section.body.push(`![Course Logo](${imgUrl})`);
		}

		course.description && section.body.push(markdownify(course.description));

		// Add subject and specializations
		if (options.considerTopics) {
			course.subject && section.body.push(`**Fach:** ${course.subject.title}`);

			if (course.specializations.length > 0) {
				const topic =
					course.specializations.length > 1 ? "Spezialisierungen" : "Spezialisierung";
				section.body.push(
					`**${topic}:** ${course.specializations.map(s => s.title).join(", ")}`
				);
			}
		}
		return section;
	}

	function addSection(chapter: CourseChapter, indent: IndentationLevels) {
		const section = {
			title: chapter.title,
			indent: indent,
			body: [] as (string | object)[]
		};

		if (chapter.description) {
			const description = markdownify(chapter.description);
			section.body.push(description);
		}

		return section;
	}

	function addLessonOverviewPage(lesson: LessonExport, indent: IndentationLevels) {
		const nm = {
			title: lesson.title,
			indent: indent,
			body: [] as string[]
		};

		// Lesson's overview page, may contain:
		// - Sub title
		// - Description
		// - Self-regulated question
		lesson.subtitle && nm.body.push(markdownify(lesson.subtitle));
		lesson.description && nm.body.push(markdownify(lesson.description));
		lesson.selfRegulatedQuestion &&
			nm.body.push(markdownify(`**Aktivierungsfrage:** ${lesson.selfRegulatedQuestion}`));
		return nm;
	}

	function addLessonContent(
		contentBlock: LessonContentType,
		indent: IndentationLevels,
		contType: LessonContentMediaType
	) {
		const newIndent = parseIndent(indent + 1);

		return {
			title: getContentTypeDisplayName(contType),
			indent: newIndent,
			body: [
				contType === "video"
					? `!?[Video](${handleLessonMediaUrl(contentBlock)})`
					: handleLessonMediaUrl(contentBlock)
			]
		};
	}

	function handleLessonMediaUrl(contentBlockContent: LessonContentType) {
		if (contentBlockContent.type === "pdf" || contentBlockContent.type === "video") {
			return relativizeUrl(contentBlockContent.value.url);
		} else if (contentBlockContent.type === "article") {
			return markdownify(contentBlockContent.value.content);
		}
		return "";
	}

	function addLessonQuizzes(lesson: LessonExport, indent: IndentationLevels) {
		const incompleteExport: IncompleteNanoModuleExport = {
			nanomodule: {
				name: lesson.title,
				id: lesson.lessonId,
				slug: lesson.slug
			},
			missedElements: []
		};

		const reporter = (report: MissedElement) => {
			incompleteExport.missedElements.push(report);
		};
		//shall enable the usage of the reporter in the needed calls without affecting the convertQuizzes method
		const markdownifyForQuestions = (input: string) => {
			return markdownifyModifiedReport(input, reporter);
		};

		const quizPart = {
			title: "Lernzielkontrolle",
			indent: parseIndent(indent + 1),
			body: convertQuizzes(lesson.quiz as Quiz, markdownifyForQuestions, reporter)
		};

		// Add missing elements to the export if there are any
		if (incompleteExport.missedElements.length > 0) {
			incompleteExportedItems.push(incompleteExport);
		}

		return quizPart;
	}
}

/**
 * Converts Lessons[] to Map<lessonId, Lesson> to support faster retrieval by ID.
 * @param lessons The lessons to restructure.
 * @returns Lessons as map to identify them faster by their ID.
 */
function convertLessonsToMap(lessons: LessonExport[]) {
	const lessonsMap = new Map<string, LessonExport>();
	lessons.forEach(lesson => {
		lessonsMap.set(lesson.lessonId, lesson);
	});
	return lessonsMap;
}
