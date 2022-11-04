import { UserGroupIcon } from "@heroicons/react/solid";
import { database } from "@self-learning/database";
import { ImageCard } from "@self-learning/ui/common";
import { ItemCardGrid, TopicHeader } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";

type SpecializationPageProps = {
	specialization: ResolvedValue<typeof getSpecialization>;
};

export const getStaticProps: GetStaticProps<SpecializationPageProps> = async ({ params }) => {
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

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
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
					subtitle: true
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
				<div className="px-4 pt-12 lg:max-w-screen-lg lg:px-0">
					<ItemCardGrid>
						{courses.map(course => (
							<CourseCard
								key={course.slug}
								slug={course.slug}
								title={course.title}
								subtitle={course.subtitle}
								imgUrl={course.imgUrl}
							/>
						))}
					</ItemCardGrid>
				</div>
			</div>
		</div>
	);
}

function CourseCard({
	slug,
	title,
	subtitle,
	imgUrl
}: {
	title: string;
	slug: string;
	subtitle: string;
	imgUrl?: string | null;
}) {
	return (
		<Link legacyBehavior href={`/courses/${slug}`}>
			<a className="flex">
				<ImageCard
					slug={slug}
					imgUrl={imgUrl}
					title={title}
					subtitle={subtitle}
					footer={
						<span className="flex items-center gap-3 font-semibold text-emerald-500">
							<UserGroupIcon className="h-5" />
							<span>1.234 Absolventen</span>
						</span>
					}
				/>
			</a>
		</Link>
	);
}
