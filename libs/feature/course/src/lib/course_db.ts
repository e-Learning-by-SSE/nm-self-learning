import {database} from "@self-learning/database"

export type CombinedCourseResult = {
	courseId: string;
	title: string;
	authors: {
		displayName: string; slug: string; imgUrl?: string | null 
	}[];
	createdAt: Date;
	updatedAt: Date;
	subtitle: string;
	slug: string;
	courseType: "STANDARD" | "DYNAMIC";
	description?: string | null;
	imgUrl?: string | null;
	subjectId?: string | null;
	specializations?: {
		specializationId: string;
		title: string;
	}[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	content?: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	meta?: any;
	globalCourseVersion?: string;
	localCourseVersion?: string;
};

export async function getCombinedCourses(options?: {
	username?: string;
	courseId?: string;
	slug?: string;
	includeContent?: boolean;
	includeSpecializations?: boolean;
}): Promise<CombinedCourseResult[]> {
	const includeContent = options?.includeContent ?? false;
	const includeSpecializations = options?.includeSpecializations ?? false;

	// Get standard courses
	const standardCourseQuery = database.course.findMany({
		where: {
			...(options?.courseId ? { courseId: options.courseId } : {}),
			...(options?.slug ? { slug: options.slug } : {})
		},
		select: {
			courseId: true,
			title: true,
			subtitle: true,
			authors: {
				select: {
					displayName: true,
					slug: true,
					imgUrl: true
				}
			},
			createdAt: true,
			updatedAt: true,
			slug: true,
			description: true,
			imgUrl: true,
			subjectId: true,
			meta: includeContent,
			content: includeContent,
			...(includeSpecializations
				? {
						specializations: {
							select: {
								specializationId: true,
								title: true
							}
						}
					}
				: {})
		}
	});

	// Get dynamic courses
	const dynCourseQuery = database.dynCourse.findMany({
		where: {
			...(options?.courseId ? { courseId: options.courseId } : {}),
			...(options?.slug ? { slug: options.slug } : {})
		},
		select: {
			courseId: true,
			title: true,
			subtitle: true,
			authors: {
				select: {
					displayName: true,
					slug: true,
					imgUrl: true
				}
			},
			createdAt: true,
			updatedAt: true,
			slug: true,
			description: true,
			imgUrl: true,
			subjectId: true,
			courseVersion: true,
			meta: includeContent,
			...(includeSpecializations
				? {
						specializations: {
							select: {
								specializationId: true,
								title: true
							}
						}
					}
				: {}),
			...(options?.username && includeContent
				? {
						generatedLessonPaths: {
							where: {
								username: options.username
							},
							select: {
								content: true,
								meta: true,
								courseVersion: true
							}
						}
					}
				: {})
		}
	});

	// Run both queries in parallel
	const [standardCourses, dynCourses] = await Promise.all([standardCourseQuery, dynCourseQuery]);

	// Map standard courses to the result format
	const standardCoursesResult = standardCourses.map(course => ({
		...course,
		courseType: "STANDARD" as const
	}));

	// Map dynamic courses to the result format, including user-specific content if available
	const dynCoursesResult = dynCourses.map(course => {
		// For dynamic courses with a specified user, use their generated lesson path content if available
		let content = undefined;
		let meta = course.meta;

		if (
			options?.username &&
			includeContent &&
			course.generatedLessonPaths &&
			course.generatedLessonPaths.length > 0
		) {
			content = course.generatedLessonPaths[0].content;
			meta = course.generatedLessonPaths[0].meta;
		}

		return {
			...course,
			content,
			meta,
			courseType: "DYNAMIC" as const,
			globalCourseVersion: course.courseVersion,
			localCourseVersion: course.generatedLessonPaths?.[0]?.courseVersion ?? course.courseVersion
		};
	});

	// Combine both course types
	return [...standardCoursesResult, ...dynCoursesResult];
}
