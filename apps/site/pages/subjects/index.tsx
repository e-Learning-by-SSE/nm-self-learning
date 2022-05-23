import { CollectionIcon, VideoCameraIcon } from "@heroicons/react/outline";
import { getSubjects } from "@self-learning/cms-api";
import { ImageCard } from "@self-learning/ui/common";
import { ItemCardGrid } from "@self-learning/ui/layouts";
import { GetStaticProps } from "next";
import Link from "next/link";
import { Fragment } from "react";

type Subject = Awaited<ReturnType<typeof getSubjects>>[0];

type SubjectsProps = {
	subjects: Subject[];
};

export const getStaticProps: GetStaticProps<SubjectsProps> = async () => {
	const subjects = await getSubjects();

	return {
		props: {
			subjects
		}
	};
};

export default function Subjects({ subjects }: SubjectsProps) {
	return (
		<div className="bg-gray-50 py-16">
			<div className="mx-auto px-4 lg:max-w-screen-lg lg:px-0">
				<h1 className="mb-16 text-4xl sm:text-6xl">Fachgebiete</h1>
				<ItemCardGrid>
					{subjects.map(({ attributes }) => (
						<SubjectCard
							key={attributes!.slug}
							title={attributes!.title}
							subtitle={attributes!.subtitle}
							slug={attributes!.slug}
							imgUrl={attributes!.imageCard?.data?.attributes?.url}
						/>
					))}
				</ItemCardGrid>
			</div>
		</div>
	);
}

function SubjectCard({
	title,
	slug,
	imgUrl,
	subtitle
}: {
	title: string;
	subtitle: string | null;
	slug: string;
	imgUrl?: string | null;
}) {
	return (
		<Link href={`/subjects/${slug}`}>
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
								<span>12 Spezialisierungen</span>
							</span>
							<span className="flex items-center gap-3">
								<VideoCameraIcon className="h-5" />
								<span>420 Nanomodule</span>
							</span>
						</>
					}
				/>
			</a>
		</Link>
	);
}
