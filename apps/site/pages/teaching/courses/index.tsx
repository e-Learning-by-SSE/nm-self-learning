import { PlusIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useState } from "react";

export default function CoursesPage() {
	const [title, setTitle] = useState("");
	const { data: courses } = trpc.course.findMany.useQuery(
		{ title },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">Kurse</h1>

				<Link href="/teaching/courses/create" className="btn-primary flex w-fit">
					<PlusIcon className="h-5" />
					<span>Kurs hinzufügen</span>
				</Link>
			</div>

			<SearchField placeholder="Suche nach Titel" onChange={e => setTitle(e.target.value)} />

			<Table
				head={
					<>
						<TableHeaderColumn></TableHeaderColumn>
						<TableHeaderColumn>Titel</TableHeaderColumn>
						<TableHeaderColumn>Von</TableHeaderColumn>
					</>
				}
			>
				{courses?.map(course => (
					<tr key={course.courseId}>
						<TableDataColumn>
							<ImageOrPlaceholder
								src={course.imgUrl ?? undefined}
								className="h-16 w-24 rounded-lg object-cover"
							/>
						</TableDataColumn>

						<TableDataColumn>
							<Link
								className="text-sm font-medium hover:text-secondary"
								href={`/teaching/courses/edit/${course.courseId}`}
							>
								{course.title}
							</Link>
						</TableDataColumn>

						<TableDataColumn>
							<span className="text-light">
								{course.authors.map(a => a.displayName).join(", ")}
							</span>
						</TableDataColumn>
					</tr>
				))}
			</Table>
		</CenteredSection>
	);
}
