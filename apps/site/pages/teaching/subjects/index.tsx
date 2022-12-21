import { PlusIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";

export default function SubjectsPage() {
	const { data: subjects } = trpc.subject.getAllForAdminPage.useQuery();

	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="text-5xl">Fachgebiete</h1>

			{!subjects ? (
				<LoadingBox />
			) : (
				<div className="flex flex-col gap-8">
					<Link href="/teaching/subjects/create" className="btn-primary w-fit self-end">
						<PlusIcon className="icon" />
						<span>Hinzufügen</span>
					</Link>

					<Table
						head={
							<>
								<TableHeaderColumn></TableHeaderColumn>
								<TableHeaderColumn>Titel</TableHeaderColumn>
								<TableHeaderColumn>Admins</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
						{subjects.map(subject => (
							<tr key={subject.subjectId}>
								<TableDataColumn>
									<ImageOrPlaceholder
										src={subject.cardImgUrl ?? undefined}
										className="h-16 w-24 shrink-0 rounded-lg object-cover"
									/>
								</TableDataColumn>
								<TableDataColumn>
									<Link
										className="w-full font-medium hover:text-secondary"
										href={`/teaching/subjects/${subject.subjectId}`}
									>
										{subject.title}
									</Link>
								</TableDataColumn>
								<TableDataColumn>
									<span className="text-light">
										{subject.subjectAdmin
											.map(a => a.author.displayName)
											.join(", ")}
									</span>
								</TableDataColumn>
								<TableDataColumn>
									<div className="flex justify-end">
										<Link
											className="btn-stroked"
											href={`/teaching/subjects/${subject.subjectId}/edit`}
										>
											Editieren
										</Link>
									</div>
								</TableDataColumn>
							</tr>
						))}
					</Table>
				</div>
			)}
		</CenteredSection>
	);
}
