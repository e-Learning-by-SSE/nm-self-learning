import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import {
	LoadingBox,
	Paginator,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { formatDateDistanceToNow } from "@self-learning/util/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";
import { LessonDeleteOption } from "@self-learning/ui/lesson";
import { keepPreviousData } from "@tanstack/react-query";

export default function LessonManagementPage() {
	const router = useRouter();
	const { page = 1, title: titleRaw } = router.query;
	const { data } = trpc.lesson.findMany.useQuery(
		{ title: titleRaw as string, page: Number(page) },
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData,
			enabled: router.isReady
		}
	);
	console.log(data);

	const session = useRequiredSession();
	if (session.data?.user.role !== "ADMIN") {
		return <AdminGuard></AdminGuard>;
	}

	if (!router.isReady) {
		return <LoadingBox />;
	}

	const title = titleRaw as string;

	return (
		<CenteredSection>
			<div className="mb-16 flex items-center justify-between gap-4 ">
				<h1 className="text-5xl">Lerneinheiten</h1>

				<Link href="/teaching/lessons/create" className="btn-primary flex w-fit">
					<PlusIcon className="icon h-5" />
					<span>Lerneinheit erstellen</span>
				</Link>
			</div>

			<SearchField
				placeholder="Suche nach Titel"
				value={title}
				onChange={e => {
					router.push(
						{
							pathname: router.pathname,
							query: {
								...router.query,
								title: e.target.value,
								page: 1
							}
						},
						undefined,
						{ shallow: true }
					);
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
								className="text-sm font-medium hover:text-c-primary"
								href={`/teaching/lessons/edit/${lesson.lessonId}`}
							>
								{lesson.title}
							</Link>
						</TableDataColumn>

						<TableDataColumn>
							<span className="text-c-text-muted">
								{lesson.authors.map(a => a.displayName).join(", ")}
							</span>
						</TableDataColumn>

						<TableDataColumn>
							<div className="flex items-right gap-4">
								<span
									className="text-c-text-muted"
									title={new Date(lesson.updatedAt).toLocaleString()}
								>
									{formatDateDistanceToNow(lesson.updatedAt)}
								</span>
								<LessonDeleteOption lessonId={lesson.lessonId} />
							</div>
						</TableDataColumn>
					</tr>
				))}
			</Table>

			{data?.result && <Paginator pagination={data} url={`/admin/lessons?title=${title}`} />}
		</CenteredSection>
	);
}

export const getServerSideProps = withTranslations(["common"]);
