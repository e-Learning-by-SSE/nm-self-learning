import { LinkIcon, PencilIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { SearchCourseDialog } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import { ResourceGroupChips } from "@self-learning/teaching";
import {
	ImageOrPlaceholder,
	I18N_NAMESPACE as NS_UI_COMMON,
	LoadingBox,
	OnDialogCloseFn,
	Paginator,
	SectionHeader,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import {
	CenteredContainerXL,
	TopicHeader,
	useCanCreate,
	useResourceGuard
} from "@self-learning/ui/layouts";
import { AccessLevel } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { withTranslations } from "@self-learning/api";
import { keepPreviousData } from "@tanstack/react-query";
import { toResourcePermissionsForm } from "@self-learning/types";

export default function SpecializationManagementPage() {
	const router = useRouter();
	const { page = 1, title = "" } = router.query;
	const [titleFilter, setTitle] = useState(title);
	const canCreateCourse = useCanCreate();

	const { data: specialization, isLoading } = trpc.specialization.getForEdit.useQuery(
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
			placeholderData: keepPreviousData
		}
	);

	const permittedGroups = specialization
		? toResourcePermissionsForm(specialization.permissions)
		: undefined;
	const canEdit = useResourceGuard(AccessLevel.EDIT, permittedGroups);

	const [addCourseDialog, setAddCourseDialog] = useState(false);
	const { mutateAsync: addCourse } = trpc.specialization.addCourse.useMutation();
	const { mutateAsync: removeCourse } = trpc.specialization.removeCourse.useMutation();

	const handleAddCourse: OnDialogCloseFn<{ courseId: string; title: string }> = async course => {
		setAddCourseDialog(false);
		if (!course || !specialization) return;

		try {
			await addCourse({
				subjectId: specialization.subjectId,
				specializationId: specialization.specializationId,
				courseId: course.courseId
			});
			showToast({
				type: "success",
				title: "Kurs hinzugefügt",
				subtitle: `Kurs "${course.title}" wurde erfolgreich hinzugefügt.`
			});
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	};

	async function handleRemoveCourse(course: { title: string; courseId: string }): Promise<void> {
		const confirmed = window.confirm(
			`Kurs "${course.title}" wirklich aus dieser Spezialisierung entfernen?}"`
		);

		if (!specialization || !confirmed) return;

		try {
			await removeCourse({
				subjectId: specialization.subjectId,
				specializationId: specialization?.specializationId,
				courseId: course.courseId
			});
			showToast({
				type: "success",
				title: "Kurs entfernt",
				subtitle: `Kurs "${course.title}" wurde entfernt.`
			});
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	}

	if (isLoading || !specialization) {
		return <LoadingBox />;
	}

	return (
		<div className="flex flex-col gap-8 pb-32">
			<TopicHeader
				imgUrlBanner={specialization.imgUrlBanner}
				parentLink="/subjects"
				parentTitle="Fachgebiet"
				title={specialization.title}
				subtitle={specialization.subtitle}
			>
				{canEdit && (
					<Link
						href={`/teaching/subjects/${specialization.subjectId}/${specialization.specializationId}/edit`}
						className="btn-primary absolute top-8 w-fit self-end"
					>
						<PencilIcon className="icon h-5" />
						<span>Bearbeiten</span>
					</Link>
				)}
			</TopicHeader>

			<CenteredContainerXL>
				<ResourceGroupChips permissions={specialization.permissions} />
				<SectionHeader
					title="Kurse"
					subtitle="Kurse, die dieser Spezialisierung zugeordnet sind."
				/>

				<div className="mb-8 flex flex-wrap gap-4">
					{canCreateCourse && (
						<Link
							className="btn-primary w-fit"
							href={`/teaching/courses/create?specializationId=${specialization.specializationId}&subjectId=${specialization.subjectId}`}
						>
							<PlusIcon className="icon h-5" />
							<span>Kurs erstellen</span>
						</Link>
					)}

					{canEdit && (
						<button
							className="btn-stroked w-fit"
							onClick={() => setAddCourseDialog(true)}
						>
							<LinkIcon className="icon h-5" />
							<span>Kurs verknüpfen</span>
						</button>
					)}

					{addCourseDialog && (
						<SearchCourseDialog open={addCourseDialog} onClose={handleAddCourse} />
					)}
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
									<TableHeaderColumn></TableHeaderColumn>
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
											className="text-sm font-medium hover:text-c-primary"
											href={`/courses/${course.slug}`}
										>
											{course.title}
										</Link>
									</TableDataColumn>

									<TableDataColumn>
										<span className="text-c-text-muted">
											{course.authors.map(a => a.displayName).join(", ")}
										</span>
									</TableDataColumn>
									<TableDataColumn>
										{canEdit && (
											<div className="flex justify-end">
												<button
													className="rounded-full p-2 text-gray-400 hover:bg-c-neutral-muted hover:text-c-danger"
													title="Aus Spezialisierung entfernen"
													onClick={() => handleRemoveCourse(course)}
												>
													<XMarkIcon className="h-5" />
												</button>
											</div>
										)}
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
}

export const getServerSideProps = withTranslations(
	Array.from(new Set(["common", ...NS_UI_COMMON]))
);
