import { PuzzleIcon } from "@heroicons/react/solid";
import { database } from "@self-learning/database";
import { CourseMeta } from "@self-learning/types";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { ItemCardGrid, TopicHeader } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import Link from "next/link";

type SpecializationPageProps = {
	specialization: ResolvedValue<typeof getSpecialization>;
};

export const getServerSideProps: GetServerSideProps<SpecializationPageProps> = async ({
	params
}) => {
	const specializationSlug = params?.specializationSlug;

	if (typeof specializationSlug !== "string") {
		throw new Error("[specializationSlug] must be a string.");
	}

	const specialization = await getSpecialization(specializationSlug);

	return {
		props: {
			specialization: specialization as Defined<typeof specialization>
		},
		notFound: !specialization
	};
};

async function getSpecialization(specializationSlug: string) {
	return await database.specialization.findUnique({
		where: { slug: specializationSlug },
		select: {
			imgUrlBanner: true,
			slug: true,
			title: true,
			subtitle: true,
			courses: {
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

	return (
		<div className="bg-gray-50 pb-32">
			<div className="mx-auto flex max-w-screen-xl flex-col">
				<TopicHeader
					imgUrlBanner={imgUrlBanner}
					parentLink={`/subjects/${subject.slug}`}
					parentTitle={subject.title}
					title={title}
					subtitle={subtitle}
				/>
				<div className="px-4 pt-12 xl:px-0">
					<ItemCardGrid>
						{courses.map(course => (
							<CourseCard key={course.slug} course={course} />
						))}
					</ItemCardGrid>
				</div>
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
						<PuzzleIcon className="h-5" />
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
