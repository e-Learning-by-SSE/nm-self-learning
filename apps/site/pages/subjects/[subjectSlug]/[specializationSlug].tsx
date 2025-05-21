import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { database } from "@self-learning/database";
import { CourseMeta, Defined, ResolvedValue } from "@self-learning/types";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { ItemCardGrid, TopicHeader } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { withAuth, withTranslations } from "@self-learning/api";

type SpecializationPageProps = {
	specialization: ResolvedValue<typeof getSpecialization>;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<SpecializationPageProps>(async (ctx, user) => {
		const specializationSlug = ctx.params?.specializationSlug;

		if (typeof specializationSlug !== "string") {
			throw new Error("[specializationSlug] must be a string.");
		}

		const specialization = await getSpecialization(specializationSlug, user.name);

		return {
			props: {
				...(await serverSideTranslations(ctx.locale ?? "en", ["common"])),
				specialization: specialization as Defined<typeof specialization>
			},
			notFound: !specialization
		};
	})
);

async function getSpecialization(specializationSlug: string, username: string) {
	return await database.specialization.findUnique({
		where: { slug: specializationSlug },
		select: {
			imgUrlBanner: true,
			slug: true,
			title: true,
			subtitle: true,
			courses: {
				orderBy: { title: "asc" },
				select: {
					slug: true,
					imgUrl: true,
					title: true,
					subtitle: true,
					meta: true
				}
			},
			newCourses: {
				orderBy: { title: "asc" },
				select: {
					courseVersion: true,
					generatedLessonPaths: {
						where: {
							username: username
						}
					},
					slug: true,
					imgUrl: true,
					title: true,
					subtitle: true,
					meta: true
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

export default function SpecializationPage({ specialization }: SpecializationPageProps) {
	const { title, subtitle, imgUrlBanner, subject, courses, newCourses } = specialization;

	return (
		<div className="bg-gray-50 pb-32">
			<TopicHeader
				imgUrlBanner={imgUrlBanner}
				parentLink={`/subjects/${subject.slug}`}
				parentTitle={subject.title}
				title={title}
				subtitle={subtitle}
			/>
			<div className="mx-auto flex max-w-screen-xl flex-col px-4 pt-8 xl:px-0">
				{courses.length > 0 ? (
					<ItemCardGrid>
						{courses.map(course => (
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
			<div className="mx-auto flex max-w-screen-xl flex-col px-4 pt-8 xl:px-0">
				{newCourses.length > 0 ? (
					<ItemCardGrid>
						{newCourses.map(course => (
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
	const meta = course.meta as CourseMeta;

	return (
		<Link href={`/courses/${course.slug}`} className="flex">
			<ImageCard
				slug={course.slug}
				imgUrl={course.imgUrl}
				title={course.title}
				subtitle={course.subtitle}
				badge={<ImageCardBadge text="Lernkurs" className="bg-emerald-500" />}
				footer={
					<span className="flex items-center gap-3 text-sm font-semibold text-emerald-500">
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
