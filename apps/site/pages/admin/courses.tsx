import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";
import { keepPreviousData } from "@tanstack/react-query";

export default function CoursesPage() {
	const router = useRouter();
	const { page = 1, title: titleRaw } = router.query;
	const { data } = trpc.course.findMany.useQuery(
		{ title: titleRaw as string, page: Number(page) },
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData,
			enabled: router.isReady
		}
	);

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
			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">Kurse</h1>

				<Link href="/teaching/courses/create" className="btn-primary flex w-fit">
					<PlusIcon className="h-5" />
					<span>Kurs erstellen</span>
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
						<TableHeaderColumn></TableHeaderColumn>
						<TableHeaderColumn>Titel</TableHeaderColumn>
						<TableHeaderColumn>Von</TableHeaderColumn>
					</>
				}
			>
				{data?.result.map(course => (
					<tr key={course.courseId}>
						<TableDataColumn>
							<ImageOrPlaceholder
								src={course.imgUrl ?? undefined}
								className="h-16 w-24 rounded-lg object-cover"
							/>
						</TableDataColumn>

						<TableDataColumn>
							<Link
								className="text-sm font-medium hover:text-c-primary"
								href={`/teaching/courses/edit/${course.courseId}`}
							>
								{course.title}
							</Link>
						</TableDataColumn>

						<TableDataColumn>
							<span className="text-c-text-muted">
								{course.authors.map(a => a.displayName).join(", ")}
							</span>
						</TableDataColumn>
					</tr>
				))}
			</Table>

			{data?.result && <Paginator pagination={data} url={`/admin/courses?title=${title}`} />}
		</CenteredSection>
	);
}

export const getServerSideProps = withTranslations(["common"]);
