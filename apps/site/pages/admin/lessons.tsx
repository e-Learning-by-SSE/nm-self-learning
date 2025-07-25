import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Paginator, Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { formatDateAgo } from "@self-learning/util/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { withTranslations } from "@self-learning/api";
import { LessonDeleteOption } from "@self-learning/ui/lesson";

export default function LessonManagementPage() {
	const router = useRouter();
	const { page = 1, title = "" } = router.query;
	const [titleFilter, setTitle] = useState(title);
	const { data } = trpc.lesson.findMany.useQuery(
		{ title: titleFilter as string, page: Number(page) },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	useEffect(() => {
		// We need this effect, because router.query is empty on first render
		setTitle(title as string);
	}, [title]);

	const session = useRequiredSession();
	if (session.data?.user.role !== "ADMIN") {
		return <AdminGuard></AdminGuard>;
	}

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4 ">
				<h1 className="text-5xl">Lerneinheiten</h1>

				<Link href="/teaching/lessons/create" className="btn-primary flex w-fit">
					<PlusIcon className="icon h-5" />
					<span>Lerneinheit hinzufügen</span>
				</Link>
			</div>

			<SearchField
				placeholder="Suche nach Titel"
				value={titleFilter}
				onChange={e => {
					setTitle(e.target.value);

					router.query.title = e.target.value;
					router.query.page = "1";

					router.push(router, undefined, {
						shallow: true
					});
				}}
			/>

			<Table
				head={
					<>
						<TableHeaderColumn>Titel</TableHeaderColumn>
						<TableHeaderColumn>Von</TableHeaderColumn>
						<TableHeaderColumn>Letzte Änderung</TableHeaderColumn>
					</>
				}
			>
				{data?.result.map(lesson => (
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

						<TableDataColumn>
							<div className="flex items-right gap-4">
								<span
									className="text-light"
									title={new Date(lesson.updatedAt).toLocaleString()}
								>
									{formatDateAgo(lesson.updatedAt)}
								</span>
								<LessonDeleteOption lessonId={lesson.lessonId} />
							</div>
						</TableDataColumn>
					</tr>
				))}
			</Table>

			{data?.result && (
				<Paginator pagination={data} url={`/admin/lessons?title=${titleFilter}`} />
			)}
		</CenteredSection>
	);
}

export const getServerSideProps = withTranslations(["common"]);
