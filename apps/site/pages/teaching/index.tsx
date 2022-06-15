import { PlusIcon } from "@heroicons/react/solid";
import { database } from "@self-learning/database";
import { CenteredSection } from "@self-learning/ui/layouts";
import { InferGetServerSidePropsType } from "next";
import Link from "next/link";

export const getServerSideProps = async () => {
	const lessons = await database.lesson.findMany({
		select: {
			title: true,
			slug: true,
			lessonId: true
		}
	});

	return {
		props: { lessons }
	};
};

export default function TeachingPage({
	lessons
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<CenteredSection>
			<div className="flex flex-col gap-8">
				<Link href="/teaching/lessons/create">
					<a className="btn-primary w-fit">
						<PlusIcon className="h-5" />
						<span>Lerneinheit hinzufügen</span>
					</a>
				</Link>

				<Link href="/teaching/courses/create">
					<a className="btn-primary w-fit">
						<PlusIcon className="h-5" />
						<span>Kurs hinzufügen</span>
					</a>
				</Link>

				<div className="flex flex-col gap-2">
					{lessons.map(lesson => (
						<Link key={lesson.lessonId} href={`/teaching/lessons/edit/${lesson.slug}`}>
							<a className="text-sm font-medium">
								<span>{lesson.title} editieren</span>
							</a>
						</Link>
					))}
				</div>
			</div>
		</CenteredSection>
	);
}
