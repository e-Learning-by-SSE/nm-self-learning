import {
	toPlainText,
	markdownify as markdownifyDelegate,
	ExportFormat,
	liaScriptExport,
	IndentationLevels,
	selectNarrator,
	removeStorageUrls
} from "./liascript-api-utils";
import { FullCourseExport as CourseWithLessons } from "@self-learning/teaching";
import { LessonContent as LessonExport } from "@self-learning/lesson";
import { Quiz } from "@self-learning/quiz";

import { CourseChapter, LessonContent, findContentType } from "@self-learning/types";
import {
	ExportOptions,
	IncompleteNanoModuleExport,
	MediaFileReplacement,
	MissedElement
} from "./types";
import { convertQuizzes } from "./question-utils";
import JSZip from "jszip";
import { downloadWithProgress, getFileSize } from "./network-utils";
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
	onProgress?: (progress: number) => void,
	onInfo?: (msg: string) => void,
	exportOptions?: ExportOptions
) {
	const options: ExportOptions = {
		storageDestination: `media/${course.slug}/`,
		...exportOptions
	};
	// Generate markdown file and create a zip archive with this file
	const { markdown, mediaFiles, incompleteExportedItems } = await exportCourse(
		{ course, lessons },
		options
	);
	const zip = new JSZip();
	zip.file(`${course.title}.md`, markdown);

	// Download all media files located on our storage server

	// Compute the total size of all media files
	let downloadSize = 0;
	const sizePerFile = new Map<string, number>();
	for (const mediaFile of mediaFiles) {
		const size = await getFileSize(mediaFile.source);
		downloadSize += size;
		sizePerFile.set(mediaFile.source, size);
	}
	// Zipping takes also some time, we roughly estimate 10% overheads for this
	const totalSize = 1.1 * downloadSize;

	// Download all media files, add them to the zip archive, and report progress
	let alreadyLoaded = 0;
	for (const mediaFile of mediaFiles) {
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

	// 100 % of download completed, but not zipped yet
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
	const mediaFiles: MediaFileReplacement[] = [];

	// The JSON object that is used as input for the LiaScript API
	let courseDescription: string | undefined;
	if (course.description) {
		const { text, resources } = removeStorageUrls(toPlainText(course.description), {
			storageUrls: options.storagesToInclude,
			storageDestination: options.storageDestination
		});
		courseDescription = text;
		mediaFiles.push(...resources);
	}

	// Stores the list of items which could not exported completely
	// Will be altered by side effect of nested functions
	const incompleteExportedItems: IncompleteNanoModuleExport[] = [];

	const json: ExportFormat = {
		// The list of supported items are documented here:
		// https://liascript.github.io/course/?https://raw.githubusercontent.com/liaScript/docs/master/README.md#176
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
	const sections = json.sections;

	// The lessons of the course, accessible by their ID
	const lessonsMap = convertLessonsToMap(lessons);

	if (options.addTitlePage) {
		addTitlePage();
	}

	for (const chapter of course.content as CourseChapter[]) {
		// Chapters are collections of lessons.
		const baseIndent = options.addTitlePage ? 2 : 1;
		addSection(chapter, baseIndent);
	}

	const markdown = await liaScriptExport(json);
	return { markdown, mediaFiles, incompleteExportedItems };

	/**
	 * Checks if a given (optional) URL points to a file on our storage.
	 * If so, it adds it to the list of media files and returns the relative path.
	 * @param url A media URL (video, image, etc.) which may point to our storage.
	 * @returns A relative URL or the input URL if it does not point to our storage.
	 */
	function relativizeUrl(url?: string) {
		if (!url) return "";

		if (options.storagesToInclude && options.storagesToInclude.length > 0) {
			for (const storageUrl of options.storagesToInclude) {
				if (url.startsWith(storageUrl)) {
					const source = url;
					url = url.replace(storageUrl, options.storageDestination ?? "");
					mediaFiles.push({ source, destination: url });
					break;
				}
			}
		}
		return url;
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
		mediaFiles.push(...resources);

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
		sections.push(section);
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

		sections.push(section);

		chapter.content.forEach(entry => {
			const lesson = lessonsMap.get(entry.lessonId);
			if (lesson) {
				const lessonIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
				addLesson(lesson, lessonIndent);
			}
		});
	}

	function addLesson(lesson: LessonExport, indent: IndentationLevels) {
		// List of potentially incomplete exported elements
		const incompleteExport: IncompleteNanoModuleExport = {
			nanomodule: {
				name: lesson.title,
				id: lesson.lessonId,
				slug: lesson.slug
			},
			missedElements: []
		};

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
		sections.push(nm);

		// Convert content, which may contain: video, article, pdf, link to external web page
		const lessonContent = lesson.content as LessonContent;
		const video = findContentType("video", lessonContent);
		if (video.content) {
			const videoIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const videoUrl = relativizeUrl(video.content.value.url);
			const videoPart = {
				title: "Video",
				indent: videoIndent,
				body: [`!?[Video](${videoUrl})`]
			};

			sections.push(videoPart);
		}

		const article = findContentType("article", lessonContent);
		if (article.content) {
			const articleIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const articleUrl = markdownify(article.content.value.content);
			const articlePart = {
				title: "Artikel",
				indent: articleIndent,
				body: [articleUrl]
			};

			sections.push(articlePart);
		}

		const pdf = findContentType("pdf", lessonContent);
		if (pdf.content) {
			const pdfIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const pdfUrl = relativizeUrl(pdf.content.value.url);
			const pdfPart = {
				title: "PDF",
				indent: pdfIndent,
				body: [pdfUrl]
			};

			sections.push(pdfPart);
		}

		// Add quizzes
		if (lesson.quiz) {
			const reporter = (report: MissedElement) => {
				incompleteExport.missedElements.push(report);
			};
			//shall enable the usage of the reporter in the needed calls without affecting the convertQuizzes method
			const markdownifyForQuestions = (input: string) => {
				return markdownifyModifiedReport(input, reporter);
			};

			const quizIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const quizPart = {
				title: "Lernzielkontrolle",
				indent: quizIndent,
				body: convertQuizzes(lesson.quiz as Quiz, markdownifyForQuestions, reporter)
			};

			sections.push(quizPart);
		}

		// Add missing elements to the export if there are any
		if (incompleteExport.missedElements.length > 0) {
			incompleteExportedItems.push(incompleteExport);
		}
	}
}

/**
 * Converts Lessons[] to Map<lessonId, Lesson> to support faster retrieval by ID.
 * @param lessons The lessons to restructure.
 * @returns Lessons as map to identify them faster by their ID.
 */
function convertLessonsToMap(lessons: LessonExport[]) {
	const lessonsMap = new Map<string, LessonExport>();
	for (const lesson of lessons) {
		console.log(">>Adding a lesson to map?", lesson.title);
		lessonsMap.set(lesson.lessonId, lesson);
	}
	return lessonsMap;
}
