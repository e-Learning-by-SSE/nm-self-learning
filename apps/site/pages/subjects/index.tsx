import { CollectionIcon, VideoCameraIcon } from "@heroicons/react/outline";
import { getSubjects } from "@self-learning/cms-api";
import { ImageCard } from "@self-learning/ui/common";
import { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";

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
		<div className="gradient min-h-screen py-16">
			<div className="mx-auto px-4 lg:max-w-screen-lg lg:px-0">
				<h1 className="text-4xl sm:text-6xl">Fachgebiete</h1>
				<div className="mt-16 grid gap-16 md:grid-cols-2 lg:grid-cols-3">
					{subjects.map(subject => (
						<SubjectCard
							key={subject.attributes!.slug}
							title={subject.attributes!.title}
							subtitle={subject.attributes!.subtitle}
							slug={subject.attributes!.slug}
							imgUrl={subject.attributes!.imageCard!.data!.attributes!.url}
						/>
					))}
				</div>
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
	imgUrl: string | null;
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
