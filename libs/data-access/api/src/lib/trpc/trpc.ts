import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { database } from "@self-learning/database";
import { Context } from "./context";
import superjson from "superjson";
import { OpenApiMeta } from "trpc-openapi";

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
	transformer: superjson
});

const authMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({ ctx: ctx as Required<Context> });
});

const adminMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (ctx.user.role !== "ADMIN") {
		throw new TRPCError({ code: "FORBIDDEN", message: "Requires 'ADMIN' role." });
	}

	return next({ ctx: ctx as Required<Context> });
});

export const isAuthorMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (!ctx.user.isAuthor) {
		console.log(ctx.user.role !== "ADMIN")
		if (ctx.user.role !== "ADMIN") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Requires 'AUTHOR' or 'ADMIN'  role."
			});
		}
	}

	return next({ ctx: ctx as Required<Context> });
});

export const lessonAuthorMiddleware = t.middleware(async ({ ctx, next, rawInput }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const parsed = z.object({ lessonId: z.string() }).safeParse(rawInput);
	if (!parsed.success) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Invalid input: missing or malformed 'lessonId'."
		});
	}

	const { lessonId } = parsed.data;

	if (ctx.user.role !== "ADMIN") {
		const isAuthor = await checkIfUserIsLessonAuthor(ctx.user.name, lessonId);
		if (!isAuthor) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "User is not an author of this lesson."
			});
		}
	}

	return next({ ctx: ctx as Required<Context> });
});

/** Creates a `t.procedure` that requires an authenticated user. */
export const authProcedure = t.procedure.use(authMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with `ADMIN` role. */
export const adminProcedure = t.procedure.use(adminMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with `AUTHOR` role. */
export const authorProcedure = t.procedure.use(isAuthorMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with the `AUTHOR` role and verifies that they are the author of the specified lesson. Users with the `ADMIN` role automatically pass the authorship check. */
export const lessonAuthorProcedure = t.procedure
	.use(isAuthorMiddleware)
	.use(lessonAuthorMiddleware);
/** Procedure that valides if user is author of given course. */
export const isCourseAuthorProcedure = t.procedure
	.input(z.object({ courseId: z.string() }))
	.use(async opts => {
		const { courseId } = opts.input;
		const { user } = opts.ctx;

		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		if (user.role === "ADMIN") {
			return opts.next();
		}

		const isAuthor = await checkIfUserIsCourseAuthor(user.name, courseId);
		if (!isAuthor) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User is not author of this course!"
			});
		}

		return opts.next();
	});

async function checkIfUserIsCourseAuthor(username: string, courseId: string) {
	const course = await database.course.findUniqueOrThrow({
		where: { courseId },
		select: {
			authors: {
				select: {
					username: true
				}
			}
		}
	});

	return course.authors.some(author => author.username === username);
}

async function checkIfUserIsLessonAuthor(username: string, lessonId: string) {
	const lesson = await database.lesson.findUniqueOrThrow({
		where: { lessonId },
		select: {
			authors: {
				select: {
					username: true
				}
			}
		}
	});

	return lesson.authors.some(author => author.username === username);
}
