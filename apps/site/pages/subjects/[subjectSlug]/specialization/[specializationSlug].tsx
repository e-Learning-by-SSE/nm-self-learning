import { UserGroupIcon } from "@heroicons/react/solid";
import { getSpecializationBySlug } from "@self-learning/cms-api";
import { ImageCard } from "@self-learning/ui/common";
import { TopicHeader } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
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
			specialization: specialization as ResolvedValue<typeof getSpecializationBySlug>
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
	const { slug, title, subtitle, imageBanner, subject } = specialization;
	const imgUrlBanner = imageBanner?.data?.attributes?.url ?? null;
	const { title: subjectTitle, slug: subjectSlug } = subject?.data?.attributes || {};

	return (
		<div className="gradient min-h-screen pb-32">
			<div className="mx-auto flex flex-col lg:max-w-screen-lg">
				<TopicHeader imgUrlBanner={imgUrlBanner}>
					<Link href={`/subjects/${subjectSlug}`}>
						<a>
							<h2 className="text-2xl text-indigo-500">{subjectTitle}</h2>
						</a>
					</Link>
					<h1 className="mt-2 text-6xl">{title}</h1>
					<div className="mt-4 text-slate-500">{subtitle}</div>
				</TopicHeader>
				<div className="px-4 pt-12 lg:max-w-screen-lg lg:px-0">
					<div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
						<CourseCard
							imgUrl={null}
							slug="the-example-course"
							title="Programmierung mit Java"
							subtitle="A boilerplate driven language designed for writing verbose object-oriented instant legacy code."
						/>
					</div>
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
	imgUrl: string | null;
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
