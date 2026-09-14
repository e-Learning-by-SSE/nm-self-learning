import { PencilIcon, PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { database } from "@self-learning/database";
import { CourseMeta, Defined, ResolvedValue } from "@self-learning/types";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { ItemCardGrid, testResourceGuard, TopicHeader } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { withTranslations } from "@self-learning/api";

type SpecializationPageProps = {
	specialization: ResolvedValue<typeof getSpecialization>;
};

export const getServerSideProps = withTranslations(["common"], async ({ params, locale }) => {
	const specializationSlug = params?.specializationSlug;

	if (typeof specializationSlug !== "string") {
		throw new Error("[specializationSlug] must be a string.");
	}

	const specialization = await getSpecialization(specializationSlug);

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			specialization: specialization as Defined<typeof specialization>
		},
		notFound: !specialization
	};
});

async function getSpecialization(specializationSlug: string) {
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
	const { title, subtitle, imgUrlBanner, subject, courses } = specialization;
	const { t } = useTranslation("common");
	const { data: session } = useSession();
	const canEdit =
		!!session?.user &&
		testResourceGuard(session.user, AccessLevel.EDIT, specialization.permissions);

	return (
		<div className="pb-32">
			<TopicHeader
				imgUrlBanner={imgUrlBanner}
				parentLink={`/subjects/${subject.slug}`}
				parentTitle={subject.title}
				title={title}
				subtitle={subtitle}
			>
				{canEdit && (
					<Link
						href={`/teaching/subjects/${specialization.subjectId}/${specialization.specializationId}/edit`}
						className="btn-primary absolute top-8 w-fit self-end"
					>
						<PencilIcon className="icon h-5" />
						<span>{t("edit")}</span>
					</Link>
				)}
			</TopicHeader>
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
				badge={<ImageCardBadge text="Lernkurs" className="bg-c-primary" />}
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
