/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "*.svg" {
	const content: any;
	export const ReactComponent: any;
	export default content;
}

/**
 * Type alias that excludes `null` and `undefined` from the return type of an async function.
 *
 * @example
 * async function tryGetCourse(): Promise<CourseObject | null | undefined> { ... }
 * type Course = ResolvedValue<typeof tryGetCourse>; // CourseObject
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolvedValue<Fn extends (...args: any) => unknown> = Exclude<
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
type Defined<T> = Exclude<T, undefined | null>;
