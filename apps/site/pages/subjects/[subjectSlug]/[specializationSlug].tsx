import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { database } from "@self-learning/database";
import { CourseContent, CourseMeta, extractLessonIds, ResolvedValue } from "@self-learning/types";
import { I18N_NAMESPACE as NS_TEACHING, SpecializationHeader } from "@self-learning/teaching";
import { ImageCard, ImageCardBadge, Tooltip } from "@self-learning/ui/common";
import { ItemCardGrid, testResourceGuard } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { getServerSession } from "next-auth";
import { authOptions } from "@self-learning/util/auth/server";
import { withTranslations } from "@self-learning/api";
import { CourseType } from "@prisma/client";

type SpecializationPageProps = {
	specialization: Omit<ResolvedValue<typeof getSpecialization>, "permissions">;
	canEdit: boolean;
};

function hasLearningContent(course: { type: CourseType; content: unknown }): boolean {
	if (course.type !== CourseType.DYNAMIC) return true;
	const content = Array.isArray(course.content) ? (course.content as CourseContent) : [];
	return extractLessonIds(content).length > 0;
}

export const getServerSideProps = withTranslations<SpecializationPageProps>(
	NS_TEACHING,
	async ctx => {
		const { req, res, params } = ctx;

		const session = await getServerSession(req, res, authOptions);

		const username = session?.user?.name ?? null;

		const specializationSlug = params?.specializationSlug;

		if (typeof specializationSlug !== "string") {
			throw new Error("[specializationSlug] must be a string.");
		}

		const specialization = await getSpecialization(specializationSlug, username);
		if (!specialization) {
			return { notFound: true };
		}

		const { permissions, courses, ...publicSpecialization } = specialization;
		const filteredSpecialization = {
			...publicSpecialization,
			courses: courses.filter(hasLearningContent)
		};
		const canEdit =
			!!session?.user && testResourceGuard(session.user, AccessLevel.EDIT, permissions);

		return {
			props: {
				specialization: filteredSpecialization,
				canEdit
			}
		};
	}
);

async function getSpecialization(specializationSlug: string, username: string | null) {
	return await database.specialization.findUnique({
		where: { slug: specializationSlug },
		select: {
			specializationId: true,
			subjectId: true,
			permissions: { select: { groupId: true, accessLevel: true } },
			imgUrlBanner: true,
			slug: true,
			title: true,
			subtitle: true,
			courses: {
				orderBy: { title: "asc" },
				select: {
					version: true,
					type: true,
					// TODO unused
					// generatedLessonPaths: username
					// 	? {
					// 			where: {
					// 				username
					// 			}
					// 		}
					// 	: undefined,
					slug: true,
					imgUrl: true,
					title: true,
					subtitle: true,
					meta: true,
					content: true // to determine if a dynamic course has a default lesson path
				}
			},
			subject: {
				select: {
					slug: true,
					title: true
				}
			}
		}
	});
}

export default function SpecializationPage({ specialization, canEdit }: SpecializationPageProps) {
	const { subject, courses } = specialization;

	return (
		<div className="pb-32">
			<SpecializationHeader
				specialization={specialization}
				parentLink={`/subjects/${subject.slug}`}
				canEdit={canEdit}
			/>
			<div className="mx-auto flex max-w-screen-xl flex-col px-4 pt-8 xl:px-0">
				{courses.length > 0 ? (
					<ItemCardGrid>
						{[...courses].map(course => (
							<CourseCard key={course.slug} course={course} />
						))}
					</ItemCardGrid>
				) : (
					<div className="grid gap-16 pt-16">
						<span className="mx-auto font-semibold">
							Leider gibt es hier noch keine Inhalte.
						</span>
						<div className="mx-auto w-full max-w-md ">
							<VoidSvg />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function CourseCard({
	course
}: {
	course: SpecializationPageProps["specialization"]["courses"][0];
}) {
	const { t } = useTranslation("feature-teaching");
	const meta = course.meta as CourseMeta;
	const isStatic = course.type === CourseType.STATIC;
	const type = isStatic ? "Lernkurs" : "Dynamischer Kurs";

	return (
		<Link href={`/courses/${course.slug}`} className="flex">
			<ImageCard
				slug={course.slug}
				imgUrl={course.imgUrl}
				title={course.title}
				subtitle={course.subtitle}
				badge={
					// Same static/dynamic explanation as on the author dashboard.
					<Tooltip
						content={
							isStatic
								? t("Course_Type_Static_Tooltip")
								: t("Course_Type_Dynamic_Tooltip")
						}
					>
						<ImageCardBadge text={type} className="bg-c-primary" />
					</Tooltip>
				}
				footer={
					<span className="flex items-center gap-3 text-sm font-semibold text-c-primary">
						<PuzzlePieceIcon className="h-5" />
						<span>
							{meta.lessonCount}{" "}
							{meta.lessonCount === 1 ? "Lerneinheit" : "Lerneinheiten"}
						</span>
					</span>
				}
			/>
		</Link>
	);
}
