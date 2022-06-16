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

				<h2 className="mt-12 text-4xl">Lerneinheiten</h2>

				<div className="rounded-lg border border-light-border">
					<table className="w-full">
						<thead className="rounded-lg bg-gray-50">
							<tr className="block py-4 px-8 text-start">
								<th className="text-md font-semibold">Titel</th>
							</tr>
						</thead>
						<tbody className="">
							{lessons.map(lesson => (
								<tr
									key={lesson.lessonId}
									className="block border-b border-b-light-border px-8 py-3"
								>
									<td>
										<Link href={`/teaching/lessons/edit/${lesson.slug}`}>
											<a className="text-sm font-medium">
												<span>{lesson.title} editieren</span>
											</a>
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</CenteredSection>
	);
}
