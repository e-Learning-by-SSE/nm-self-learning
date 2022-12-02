import { trpc } from "@self-learning/api-client";
import { LoadingBox } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";

export default function SubjectsPage() {
	const { data: subjects, isLoading } = trpc.subject.getAllForAdminPage.useQuery();

	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">Fachgebiete</h1>

			{isLoading ? (
				<LoadingBox />
			) : (
				<Table
					head={
						<>
							<TableHeaderColumn></TableHeaderColumn>
							<TableHeaderColumn>Title</TableHeaderColumn>
							<TableHeaderColumn>Admins</TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
						</>
					}
					rows={
						<>
							{subjects?.map(subject => (
								<tr key={subject.subjectId}>
									<TableDataColumn>
										{subject.cardImgUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={subject.cardImgUrl}
												alt=""
												className="h-16 w-24 shrink-0 rounded-lg object-cover"
											/>
										) : (
											<div className="h-16 w-24 shrink-0 rounded-lg"></div>
										)}
									</TableDataColumn>
									<TableDataColumn>
										<Link
											className="w-full font-medium hover:text-secondary"
											href={`/subjects/${subject.subjectId}`}
										>
											{subject.title}
										</Link>
									</TableDataColumn>
									<TableDataColumn>
										<span className="text-light">
											{subject.SubjectAdmin.map(
												a => a.author.displayName
											).join(", ")}
										</span>
									</TableDataColumn>
									<TableDataColumn>
										<div className="flex justify-end">
											<Link
												className="btn-stroked"
												href={`/teaching/subjects/edit/${subject.subjectId}`}
											>
												Editieren
											</Link>
										</div>
									</TableDataColumn>
								</tr>
							))}
						</>
					}
				></Table>
			)}
		</CenteredSection>
	);
}

function Table({ head, rows }: { head: React.ReactElement; rows: React.ReactElement }) {
	return (
		<div className="light-border rounded-lg border-x border-b bg-white">
			<table className="w-full table-auto">
				<thead className="rounded-lg border-b border-b-light-border bg-gray-100">
					<tr className="border-t">{head}</tr>
				</thead>
				<tbody className="divide-y divide-light-border">{rows}</tbody>
			</table>
		</div>
	);
}

function TableHeaderColumn({ children }: { children?: React.ReactNode }) {
	return <th className="py-4 px-8 text-start text-sm font-semibold">{children}</th>;
}

function TableDataColumn({ children }: { children?: React.ReactNode }) {
	return <td className="py-4 px-8 text-sm">{children}</td>;
}
