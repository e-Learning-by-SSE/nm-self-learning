import { LinkIcon, PencilIcon, PlusIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { LoadingBox, SectionHeader } from "@self-learning/ui/common";
import { CenteredContainerXL, TopicHeader, Unauthorized } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import {
	ImageOrPlaceholder,
	Paginator,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";

export default function SubjectManagementPage() {
	const router = useRouter();
	const { page = 1, title = "" } = router.query;
	const [titleFilter, setTitle] = useState(title);

	const { data: permissions } = trpc.me.permissions.useQuery();
	const { data: specialization } = trpc.specialization.getForEdit.useQuery(
		{
			specializationId: router.query.specializationId as string
		},
		{
			enabled: !!router.query.specializationId
		}
	);
	const { data: courses } = trpc.course.findMany.useQuery(
		{
			page: Number(page),
			title: titleFilter as string,
			specializationId: specialization?.specializationId
		},
		{
			enabled: !!specialization?.specializationId,
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	const canView =
		specialization &&
		permissions &&
		(permissions.role === "ADMIN" ||
			permissions.author?.subjectAdmin.find(s => s.subjectId === specialization.subjectId) ||
			permissions?.author?.specializationAdmin.find(
				s => s.specializationId === specialization.specializationId
			));

	if (!canView) {
		return (
			<Unauthorized>
				<ul className="list-inside list-disc">
					<li>Admininstratoren</li>
					<li>Admininstratoren für Fachbereich ({router.query.subjectId})</li>
					<li>Admininstratoren für Spezialisierung ({router.query.specializationId})</li>
				</ul>
			</Unauthorized>
		);
	}

	return (
		<div className="flex flex-col gap-8 bg-gray-50 pb-32">
			<TopicHeader
				imgUrlBanner={specialization.imgUrlBanner}
				parentLink="/subjects"
				parentTitle="Fachgebiet"
				title={specialization.title}
				subtitle={specialization.subtitle}
			>
				<Link
					href={`/teaching/subjects/${specialization.subjectId}/${specialization.specializationId}/edit`}
					className="btn-primary absolute top-8 w-fit self-end"
				>
					<PencilIcon className="icon h-5" />
					<span>Editieren</span>
				</Link>
			</TopicHeader>

			<CenteredContainerXL>
				<SectionHeader
					title="Kurse"
					subtitle="Kurse, die dieser Spezialisierung zugeordnet sind."
				/>

				<div className="mb-8 flex flex-wrap gap-4">
					<Link className="btn-primary w-fit" href={`${router.asPath}/create-course`}>
						<PlusIcon className="icon h-5" />
						<span>Neuen Kurs erstellen</span>
					</Link>

					<button className="btn-stroked w-fit" disabled={true}>
						<LinkIcon className="icon h-5" />
						<span>Existierenden Kurs hinzufügen</span>
					</button>
				</div>

				<SearchField
					placeholder="Suche nach Titel"
					onChange={e => setTitle(e.target.value)}
				/>

				{!courses ? (
					<LoadingBox />
				) : (
					<>
						<Table
							head={
								<>
									<TableHeaderColumn></TableHeaderColumn>
									<TableHeaderColumn>Titel</TableHeaderColumn>
									<TableHeaderColumn>Von</TableHeaderColumn>
								</>
							}
						>
							{courses?.result.map(course => (
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

						{courses?.result && (
							<Paginator
								pagination={courses}
								url={`${router.asPath}?title=${titleFilter}`}
							/>
						)}
					</>
				)}
			</CenteredContainerXL>
		</div>
	);

	return;
}
