import { CollectionIcon, VideoCameraIcon } from "@heroicons/react/outline";
import { getSubjects } from "@self-learning/cms-api";
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
							<span>12 Spezialisierungen</span>
						</span>
						<span className="flex items-center gap-3">
							<VideoCameraIcon className="h-5" />
							<span>420 Nanomodule</span>
						</span>
					</div>
				</div>
			</a>
		</Link>
	);
}
