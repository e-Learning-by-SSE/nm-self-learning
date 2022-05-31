import { UserGroupIcon } from "@heroicons/react/solid";
import { getSpecializationBySlug } from "@self-learning/cms-api";
import { ImageCard } from "@self-learning/ui/common";
import { ItemCardGrid, TopicHeader } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";

type SpecializationPageProps = {
	specialization: ResolvedValue<typeof getSpecializationBySlug>;
};

export const getStaticProps: GetStaticProps<SpecializationPageProps> = async ({ params }) => {
	const specializationSlug = params?.specializationSlug;

	if (typeof specializationSlug !== "string") {
		throw new Error("[specializationSlug] must be a string.");
	}

	const specialization = await getSpecializationBySlug(specializationSlug);

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

export default function SpecializationPage({ specialization }: SpecializationPageProps) {
	const { slug, title, subtitle, imageBanner, subject, courses } = specialization;
	const imgUrlBanner = imageBanner?.data?.attributes?.url ?? null;
	const { title: subjectTitle, slug: subjectSlug } = subject?.data?.attributes || {};

	return (
		<div className="bg-gray-50 pb-32">
			<div className="mx-auto flex max-w-screen-xl flex-col">
				<TopicHeader
					imgUrlBanner={imgUrlBanner}
					parentLink={`/subjects/${subjectSlug}`}
					parentTitle={subjectTitle as string}
					title={title}
					subtitle={subtitle}
				/>
				<div className="px-4 pt-12 lg:max-w-screen-lg lg:px-0">
					<ItemCardGrid>
						{courses?.data.map(({ attributes }) => (
							<CourseCard
								key={attributes!.slug}
								slug={attributes!.slug}
								title={attributes!.title}
								subtitle={attributes!.subtitle}
								imgUrl={attributes!.image?.data?.attributes?.url}
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
		<Link href={`/courses/${slug}`}>
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
