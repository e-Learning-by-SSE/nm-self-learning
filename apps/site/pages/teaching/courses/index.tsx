import { PlusIcon } from "@heroicons/react/solid";
import { database } from "@self-learning/database";
import { CenteredSection } from "@self-learning/ui/layouts";
import { InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";

export const getServerSideProps = async () => {
	const courses = await database.course.findMany({
		select: {
			title: true,
			slug: true,
			courseId: true,
			imgUrl: true,
			subject: {
				select: {
					title: true
				}
			},
			authors: {
				select: {
					displayName: true
				}
			}
		}
	});

	return {
		props: { courses }
	};
};

export default function CoursesPage({
	courses
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<div className="bg-gray-50">
			<CenteredSection>
				<div className="flex flex-col gap-8">
					<Link href="/teaching/courses/create">
						<a className="btn-primary w-fit">
							<PlusIcon className="h-5" />
							<span>Kurs hinzufügen</span>
						</a>
					</Link>

					<h2 className="mt-12 text-4xl">Kurse</h2>

					<div className="light-border rounded-lg border-x border-b bg-white">
						<table className="w-full table-auto">
							<thead className="rounded-lg border-b border-b-light-border bg-gray-100">
								<tr className="border-t">
									<th className="py-4 px-8 text-start text-sm font-semibold"></th>
									<th className="py-4 px-8 text-start text-sm font-semibold">
										Titel
									</th>
									<th className="py-4 px-8 text-start text-sm font-semibold">
										Von
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-light-border">
								{courses.map(course => (
									<tr key={course.courseId}>
										<td className="w-[128px] py-4 px-8 text-sm text-light">
											{course.imgUrl && (
												<Image
													src={course.imgUrl}
													height={96}
													width={128}
													className="rounded-lg object-cover"
													alt="Course Image"
												/>
											)}
										</td>

										<td className="py-4 px-8 text-sm font-medium">
											<Link
												href={`/teaching/courses/edit/${course.courseId}`}
											>
												<a className="text-sm font-medium hover:text-secondary">
													{course.title}
												</a>
											</Link>
										</td>

										<td className="py-4 px-8 text-sm text-light">
											{course.authors.map(a => a.displayName).join(", ")}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</CenteredSection>
		</div>
	);
}
