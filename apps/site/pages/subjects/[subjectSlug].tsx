import { CollectionIcon, VideoCameraIcon } from "@heroicons/react/outline";
import { getSubjectBySlug } from "@self-learning/cms-api";
import { ImageCard } from "@self-learning/ui/common";
import { TopicHeader } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { ReactComponent as VoidSvg } from "../../svg/void.svg";

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
		<div className="gradient pb-32">
			<div className="mx-auto flex flex-col lg:max-w-screen-lg">
				<TopicHeader
					imgUrlBanner={imgUrlBanner}
					parentLink="/subjects"
					parentTitle="Fachgebiet"
					title={title}
					subtitle={subtitle}
				/>
				{specialities?.data && specialities?.data.length > 0 ? (
					<div className="px-4 pt-16 lg:max-w-screen-lg lg:px-0">
						<h2 className="text-3xl">Spezialisierungen</h2>

						<div className="mt-8 grid gap-16 md:grid-cols-2 lg:grid-cols-3">
							{specialities.data.map(({ attributes }) => (
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
				) : (
					<div className="grid gap-16 pt-16 lg:gap-24 lg:pt-24">
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
			<a className="flex">
				<ImageCard
					slug={slug}
					title={title}
					subtitle={subtitle}
					imgUrl={imgUrl}
					footer={
						<>
							<span className="flex items-center gap-3">
								<CollectionIcon className="h-5" />
								<span>12 Courses</span>
							</span>
							<span className="flex items-center gap-3">
								<VideoCameraIcon className="h-5" />
								<span>123 Nanomodule</span>
							</span>
						</>
					}
				/>
			</a>
		</Link>
	);
}
