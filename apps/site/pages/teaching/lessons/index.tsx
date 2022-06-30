import { PlusIcon } from "@heroicons/react/solid";
import { database } from "@self-learning/database";
import { CenteredSection } from "@self-learning/ui/layouts";
import { InferGetServerSidePropsType } from "next";
import Link from "next/link";

export const getServerSideProps = async () => {
	const lessons = await database.lesson.findMany({
		select: {
			title: true,
			authors: {
				select: {
					displayName: true,
					id: true,
					slug: true
				}
			},
			slug: true,
			lessonId: true
		}
	});

	return {
		props: { lessons }
	};
};

export default function LessonManagementPage({
	lessons
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4 ">
				<h1 className="text-5xl">Lerneinheiten</h1>

				<Link href="/teaching/lessons/create">
					<a className="btn-primary flex w-fit">
						<PlusIcon className="h-5" />
						<span>Lerneinheit hinzufügen</span>
					</a>
				</Link>
			</div>

			<div className="light-border rounded-lg border-x border-b bg-white">
				<table className="w-full table-auto">
					<thead className="rounded-lg border-b border-b-light-border bg-gray-100">
						<tr className="border-t">
							<th className="py-4 px-8 text-start text-sm font-semibold">Titel</th>
							<th className="py-4 px-8 text-start text-sm font-semibold">Von</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-light-border">
						{lessons.map(lesson => (
							<tr key={lesson.lessonId}>
								<td className="py-4 px-8 text-sm font-medium">
									<Link href={`/teaching/lessons/edit/${lesson.lessonId}`}>
										<a className="text-sm font-medium hover:text-secondary">
											{lesson.title}
										</a>
									</Link>
								</td>

								<td className="py-4 px-8 text-sm text-light">
									{lesson.authors.map(a => a.displayName).join(", ")}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</CenteredSection>
	);
}
