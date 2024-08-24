/**
 * Type alias that excludes `null` and `undefined` from the return type of an async function.
 *
 * @example
 * async function tryGetCourse(): Promise<CourseObject | null | undefined> { ... }
 * type Course = ResolvedValue<typeof tryGetCourse>; // CourseObject
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedValue<Fn extends (...args: any) => unknown> = Exclude<
	Awaited<ReturnType<Fn>>,
	null | undefined
>;

/**
 * Type alias that excludes `null` and `undefined` from the given type.
 *
 * @example
 * const value: string | undefined = getStringOrUndefined();
 * const str: string = Defined<typeof value>;
 *
 * @example
 * // Next.js - getServerSideProps
 *	const course = await getCourseBySlug(slug);
 *
 *	return {
 *		props: {
 *			course: course as Defined<typeof course>
 *		},
 *		notFound: !course
 *	};
 */
export type Defined<T> = Exclude<T, undefined | null>;

/**
 * `PartialWithRequired` makes all properties in `T` optional except for those specified in `K`, which remain required.
 *
 * @template T - The original type.
 * @template K - A union of keys from `T` that should be required.
 *
 * @example
 * type LearningActivity = {
 *   id: number;
 *   course: string;
 *   title: string;
 * };
 *
 * type PartialLearningActivity = PartialWithRequired<LearningActivity, 'id' | 'course'>;
 *
 * // Valid: 'id' and 'course' are required
 * const activity1: PartialLearningActivity = { id: 1, course: "Math" };
 *
 * // Also valid: additional properties are optional
 * const activity2: PartialLearningActivity = { id: 1, course: "Math", title: "Lesson 1" };
 *
 * // Invalid: 'id' and 'course' are missing
 * const activity3: PartialLearningActivity = { title: "Lesson 1" }; // Error
 */
export type PartialWithRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;
