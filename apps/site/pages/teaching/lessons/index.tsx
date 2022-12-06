import { PlusIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useState } from "react";

export default function LessonManagementPage() {
	const [title, setTitle] = useState("");
	const { data } = trpc.lesson.findMany.useQuery(
		{ title },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4 ">
				<h1 className="text-5xl">Lerneinheiten</h1>

				<Link href="/teaching/lessons/create" className="btn-primary flex w-fit">
					<PlusIcon className="h-5" />
					<span>Lerneinheit hinzufügen</span>
				</Link>
			</div>

			<SearchField placeholder="Suche nach Titel" onChange={e => setTitle(e.target.value)} />

			<Table
				head={
					<>
						<TableHeaderColumn>Titel</TableHeaderColumn>
						<TableHeaderColumn>Von</TableHeaderColumn>
					</>
				}
			>
				{data?.lessons?.map(lesson => (
					<tr key={lesson.lessonId}>
						<TableDataColumn>
							<Link
								className="text-sm font-medium hover:text-secondary"
								href={`/teaching/lessons/edit/${lesson.lessonId}`}
							>
								{lesson.title}
							</Link>
						</TableDataColumn>

						<TableDataColumn>
							<span className="text-light">
								{lesson.authors.map(a => a.displayName).join(", ")}
							</span>
						</TableDataColumn>
					</tr>
				))}
			</Table>
		</CenteredSection>
	);
}
