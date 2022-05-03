import { CollectionIcon, VideoCameraIcon } from "@heroicons/react/outline";
import { getSubjectBySlug } from "@self-learning/cms-api";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolvedValue<Fn extends (...args: any) => unknown> = Exclude<
	Awaited<ReturnType<Fn>>,
	null | undefined
>;

type SubjectPageProps = {
	subject: ResolvedValue<typeof getSubjectBySlug>;
};

export const getStaticProps: GetStaticProps<SubjectPageProps> = async ({ params }) => {
	const subjectSlug = params?.subjectSlug;

	if (typeof subjectSlug !== "string") {
		throw new Error("[subjectSlug] must be a string.");
	}

	const subject = await getSubjectBySlug(subjectSlug);

	return {
		props: {
			subject: subject as ResolvedValue<typeof getSubjectBySlug>
		},
		notFound: !subject
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

export default function SubjectPage({ subject }: SubjectPageProps) {
	const { title, subtitle, specialities, imageBanner, slug } = subject;
	const imgUrlBanner = imageBanner?.data?.attributes?.url ?? "";

	return (
		<div className="min-h-screen bg-indigo-100 pb-32">
			<div className="mx-auto flex flex-col lg:max-w-screen-lg">
				<div className="relative h-80 w-full rounded-b-lg">
					<Image
						className="bg-blend rounded-b-lg"
						src={`http://localhost:1337${imgUrlBanner}`}
						layout="fill"
						alt=""
						objectFit="cover"
					/>
					<div className="absolute bottom-0 flex w-full flex-col rounded-b-lg bg-gradient-to-b from-transparent to-[#000000de] px-8 py-4 text-white">
						<h1 className="text-6xl text-white">{title}</h1>
						<div className="mt-4">{subtitle}</div>
					</div>
				</div>
				<div className="px-4 pt-12 lg:max-w-screen-lg lg:px-0">
					<div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
						{specialities?.data.map(({ attributes }) => (
							<SpecializationCard
								key={attributes!.slug}
								slug={attributes!.slug ?? ""}
								subjectSlug={slug}
								title={attributes!.title}
								subtitle={attributes!.subtitle}
								imgUrl={attributes?.imageCard?.data?.attributes?.url ?? ""}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function SpecializationCard({
	title,
	slug,
	subjectSlug,
	imgUrl,
	subtitle
}: {
	title: string;
	subtitle: string | null;
	subjectSlug: string;
	slug: string;
	imgUrl: string | null;
}) {
	return (
		<Link href={`/subjects/${subjectSlug}/specialization/${slug}`}>
			<a className="flex flex-col">
				{!imgUrl || imgUrl.length == 0 ? (
					<div className="relative h-[256px] w-full shrink-0 rounded-t-lg bg-gradient-to-br from-purple-500 to-blue-400"></div>
				) : (
					<div className="relative h-[256px] w-full shrink-0 rounded-t-lg bg-white">
						<Image
							className="rounded-t-lg"
							src={`http://localhost:1337${imgUrl}`}
							alt=""
							layout="fill"
							objectFit="cover"
						></Image>
					</div>
				)}

				<div className="glass flex h-full flex-col justify-between gap-8 rounded-b-lg p-4">
					<div className="flex flex-col gap-4">
						<h2 className="text-2xl">{title}</h2>
						<span className="text-sm text-slate-500">{subtitle}</span>
					</div>
					<div className="flex flex-col">
						<span className="flex items-center gap-3">
							<CollectionIcon className="h-5" />
							<span>12 Courses</span>
						</span>
						<span className="flex items-center gap-3">
							<VideoCameraIcon className="h-5" />
							<span>123 Nanomodule</span>
						</span>
					</div>
				</div>
			</a>
		</Link>
	);
}
