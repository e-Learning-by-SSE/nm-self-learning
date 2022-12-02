import { database } from "@self-learning/database";
import { subjectSchema } from "@self-learning/types";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const subjectRouter = t.router({
	getAllWithSpecializations: t.procedure.query(() => {
		return database.subject.findMany({
			orderBy: { title: "asc" },
			select: {
				subjectId: true,
				title: true,
				specializations: {
					orderBy: { title: "asc" },
					select: {
						title: true,
						specializationId: true
					}
				}
			}
		});
	}),
	getAllForAdminPage: t.procedure.query(() => {
		return database.subject.findMany({
			orderBy: { title: "asc" },
			select: {
				subjectId: true,
				title: true,
				cardImgUrl: true,
				SubjectAdmin: {
					select: {
						username: true,
						author: {
							select: {
								slug: true,
								displayName: true
							}
						}
					}
				},
				_count: {
					select: {
						courses: true,
						specializations: true
					}
				}
			}
		});
	}),
	getSubjectForEdit: authProcedure
		.input(z.object({ subjectId: z.string() }))
		.query(({ input }) => {
			return database.subject.findUniqueOrThrow({
				where: { subjectId: input.subjectId },
				select: {
					subjectId: true,
					slug: true,
					title: true,
					subtitle: true,
					cardImgUrl: true,
					imgUrlBanner: true
				}
			});
		}),
	updateSubject: authProcedure.input(subjectSchema).mutation(({ input }) => {
		return database.subject.update({
			where: { subjectId: input.subjectId },
			data: {
				title: input.title,
				slug: input.slug,
				subtitle: input.subtitle,
				cardImgUrl: input.cardImgUrl,
				imgUrlBanner: input.imgUrlBanner
			}
		});
	})
});
