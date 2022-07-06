import { PlusIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CoursesPage() {
	const [title, setTitle] = useState("");
	const { data: courses } = trpc.useQuery(["courses.findMany", { title }], {
		staleTime: 10_000,
		keepPreviousData: true
	});

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">Kurse</h1>

				<Link href="/teaching/courses/create">
					<a className="btn-primary flex w-fit">
						<PlusIcon className="h-5" />
						<span>Kurs hinzufügen</span>
					</a>
				</Link>
			</div>

			<SearchField placeholder="Suche nach Titel" onChange={e => setTitle(e.target.value)} />

			<div className="light-border rounded-lg border-x border-b bg-white">
				<table className="w-full table-auto">
					<thead className="rounded-lg border-b border-b-light-border bg-gray-100">
						<tr className="border-t">
							<th className="py-4 px-8 text-start text-sm font-semibold"></th>
							<th className="py-4 px-8 text-start text-sm font-semibold">Titel</th>
							<th className="py-4 px-8 text-start text-sm font-semibold">Von</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-light-border">
						{courses?.map(course => (
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
									<Link href={`/teaching/courses/edit/${course.courseId}`}>
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
		</CenteredSection>
	);
}
