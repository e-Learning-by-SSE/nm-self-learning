import { PencilIcon, PlusIcon, ExclamationCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { TeacherView } from "@self-learning/analysis";
import { t, withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { DraftsDialog, SkillRepositoryOverview } from "@self-learning/teaching";
import {
	LessonDraft,
	LessonDraftOverview,
	LessonOverview,
	LessonWithDraftInfo
} from "@self-learning/types";
import {
	Divider,
	Dialog,
	IconButton,
	ImageChip,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	DialogActions
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { formatDateAgo } from "@self-learning/util/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Specialization, Subject } from "@self-learning/types";

type Author = Awaited<ReturnType<typeof getAuthor>>;

type Props = {
	author: Author;
};

export function getAuthor(username: string) {
	return database.author.findUniqueOrThrow({
		where: { username },
		select: {
			slug: true,
			displayName: true,
			imgUrl: true,
			subjectAdmin: {
				orderBy: { subject: { title: "asc" } },
				select: {
					subject: {
						select: {
							subjectId: true,
							title: true,
							cardImgUrl: true
						}
					}
				}
			},
			specializationAdmin: {
				orderBy: { specialization: { title: "asc" } },
				select: {
					specialization: {
						select: {
							specializationId: true,
							title: true,
							cardImgUrl: true,
							subject: {
								select: {
									subjectId: true,
									title: true
								}
							}
						}
					}
				}
			},
			courses: {
				orderBy: { title: "asc" },
				select: {
					courseId: true,
					slug: true,
					title: true,
					imgUrl: true,
					specializations: {
						select: {
							title: true
						}
					}
				}
			}
		}
	});
}

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<Props>(async (context, user) => {
		if (user.isAuthor) {
			return {
				props: {
					author: await getAuthor(user.name)
				}
			};
		}

		return {
			redirect: {
				destination: "/",
				permanent: false
			}
		};
	})
);

export default function Start(props: Props) {
	return <AuthorDashboardPage {...props} />;
}

function AuthorDashboardPage({ author }: Props) {
	const session = useRequiredSession();
	const authorName = session.data?.user.name;
	const [openDraftsDialog, setOpenDraftsDialog] = useState(false);

	const {
		data: drafts,
		isLoading,
		isError
	} = trpc.lessonDraft.getByOwner.useQuery(
		{ username: authorName ?? "" },
		{
			enabled: Boolean(authorName),
			refetchOnMount: "always", // <-- ensures refetch after navigation
			staleTime: 0 // <-- disable aggressive caching (optional)
		}
	);

	let draftsWithoutLesson: LessonDraft[] = [];

	if (drafts) {
		draftsWithoutLesson = drafts.filter(draft => draft.lessonId === null);
	}

	const handleClick = (e: { preventDefault: () => void }) => {
		if (draftsWithoutLesson?.length > 0) {
			e.preventDefault();
			setOpenDraftsDialog(true);
		}
	};

	const handleClose = () => {
		setOpenDraftsDialog(false);
	};

	if (isLoading) {
		return <div></div>;
	}

	if (isError) {
		return <div>Lerneinheit-Entwürfe konnten nicht geladen werden.</div>;
	}

	return (
		<div className="bg-gray-50">
			<CenteredSection>
				<div className="flex flex-col gap-10">
					{author.subjectAdmin.length > 0 && (
						<>
							<section>
								<SectionHeader
									title="Fachgebiete"
									subtitle="Administrator in den folgenden Fachgebieten:"
								/>

								<ul className="flex flex-wrap gap-4">
									{author.subjectAdmin.map(({ subject }) => (
										<ImageChip
											key={subject.subjectId}
											imgUrl={subject.cardImgUrl}
										>
											<Link
												href={`/teaching/subjects/${subject.subjectId}`}
												className="font-medium hover:text-secondary"
											>
												{subject.title}
											</Link>
										</ImageChip>
									))}
								</ul>
							</section>
						</>
					)}

					{author.specializationAdmin.length > 0 && (
						<>
							<Divider />
							<section>
								<SectionHeader
									title="Spezialisierungen"
									subtitle="Administrator in den folgenden Spezialisierungen:"
								/>

								<ul className="flex flex-wrap gap-4">
									{author.specializationAdmin.map(({ specialization }) => (
										<ImageChip
											key={specialization.specializationId}
											imgUrl={specialization.cardImgUrl}
										>
											<Link
												href={`/teaching/subjects/${specialization.subject.subjectId}/${specialization.specializationId}`}
												className="font-medium hover:text-secondary"
											>
												{specialization.title}
											</Link>
										</ImageChip>
									))}
								</ul>
							</section>
						</>
					)}

					<Divider />

					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Meine Kurse"
								subtitle="Autor in den folgenden Kursen:"
							/>

							<Link href="/teaching/courses/create">
								<IconButton
									text="Neuen Kurs erstellen"
									icon={<PlusIcon className="icon h-5" />}
								/>
							</Link>
						</div>

						<ul className="flex flex-col gap-4 py-4">
							{author.courses.length === 0 ? (
								<div className="mx-auto flex items-center gap-8">
									<div className="h-32 w-32">
										<VoidSvg />
									</div>
									<p className="text-light">Du hast noch keine Kurse erstellt.</p>
								</div>
							) : (
								author.courses.map(course => (
									<li
										key={course.courseId}
										className="flex items-center rounded-lg border border-light-border bg-white"
									>
										<ImageOrPlaceholder
											src={course.imgUrl ?? undefined}
											className="h-16 w-16 rounded-l-lg object-cover"
										/>

										<div className="flex w-full items-center justify-between px-4">
											<div className="flex flex-col gap-1">
												<span className="text-xs text-light">
													{course.specializations
														.map(s => s.title)
														.join(" | ")}
												</span>
												<Link
													href={`/courses/${course.slug}`}
													className="text-sm font-medium hover:text-secondary"
												>
													{course.title}
												</Link>
											</div>

											<div className="flex flex-wrap justify-end gap-4">
												<Link
													href={`/teaching/courses/edit/${course.courseId}`}
													className="btn-stroked h-fit w-fit"
												>
													<PencilIcon className="icon" />
													<span>Bearbeiten</span>
												</Link>
												<CourseDeleteOption slug={course.slug} />
											</div>
										</div>
									</li>
								))
							)}
						</ul>
					</section>

					<Divider />

					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Meine Lerneinheiten"
								subtitle="Autor der folgenden Lerneinheiten:"
							/>

							<Link href="/teaching/lessons/create" onClick={handleClick}>
								<div className="relative inline-block">
									<IconButton
										text="Neue Lerneinheit erstellen"
										icon={<PlusIcon className="icon h-5" />}
									/>
									{draftsWithoutLesson?.length > 0 && (
										<ExclamationCircleIcon className="absolute top-0 right-0 h-7 text-red-500 transform translate-x-1/2 -translate-y-1/2" />
									)}
								</div>
							</Link>
						</div>

						{authorName && <Lessons authorName={authorName} />}
						{openDraftsDialog && (
							<DraftsDialog onClose={handleClose} drafts={draftsWithoutLesson} />
						)}
					</section>

					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Skillkarten"
								subtitle="Besitzer der folgenden Repositories"
							/>
							<Link href="/skills/repository/create">
								<IconButton
									icon={<PlusIcon className="icon h-5" />}
									text="Skillkarten anlegen"
								/>
							</Link>
						</div>
						<SkillRepositoryOverview />
					</section>

					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Teilnahmeübersicht"
								subtitle="Es werden aus datenschutzgründen nur Angaben bei mindestens 10
				teilnehmenden Studierenden angezeigt."
							/>
						</div>
						<TeacherView />
					</section>
				</div>
			</CenteredSection>
		</div>
	);
}

function convertToLessonWithDraftInfo(lessons: LessonOverview[]): LessonWithDraftInfo[] {
	return lessons.map(lesson => ({
		lessonId: lesson.lessonId,
		title: lesson.title,
		updatedAt: lesson.updatedAt,
		draftId: undefined,
		draftOverwritten: false
	}));
}

function addDraftInfo(
	lessons: LessonWithDraftInfo[],
	drafts: LessonDraftOverview[]
): LessonWithDraftInfo[] {
	return lessons.map(lesson => {
		const matchingDraft = drafts.find(draft => draft.lessonId === lesson.lessonId);

		let isOverwritten = false;
		if (matchingDraft) {
			if (new Date(matchingDraft.createdAt) < new Date(lesson.updatedAt)) {
				isOverwritten = true;
			}
		}

		return {
			title: lesson.title,
			lessonId: lesson.lessonId,
			updatedAt: lesson.updatedAt,
			draftId: matchingDraft?.id,
			draftOverwritten: isOverwritten
		};
	});
}

function CourseDeleteOption({ slug }: { slug: string }) {
	const { mutateAsync: deleteCourse } = trpc.course.deleteCourse.useMutation();
	const { data: linkedEntities, isLoading } = trpc.course.findLinkedEntities.useQuery({
		slug
	});
	const [showConfirmation, setShowConfirmation] = useState(false);
	const { reload } = useRouter();

	const handleDelete = async () => {
		await deleteCourse({ slug });
		// Refresh page
		reload();
	};

	const handleConfirm = () => {
		handleDelete();
		setShowConfirmation(false);
	};

	const handleCancel = () => {
		setShowConfirmation(false);
	};

	// Don't show delete button -> Empty option
	if (isLoading) {
		return <></>;
	}

	return (
		<>
			<button
				className="rounded bg-red-500 font-medium text-white hover:bg-red-600"
				onClick={() => setShowConfirmation(true)}
			>
				<div className="ml-4">
					<TrashIcon className="icon " />
				</div>
			</button>
			{showConfirmation && (
				<CourseDeletionDialog
					onCancel={handleCancel}
					onSubmit={handleConfirm}
					linkedEntities={linkedEntities}
				/>
			)}
		</>
	);
}

type CourseLinkedEntities = {
	subject: Subject | null;
	specializations: (Specialization & { subject: Subject })[];
};

function CourseDeletionDialog({
	onCancel,
	onSubmit,
	linkedEntities
}: {
	onCancel: () => void;
	onSubmit: () => void;
	linkedEntities?: CourseLinkedEntities | null;
}) {
	if (linkedEntities && (linkedEntities.subject || linkedEntities.specializations.length > 0)) {
		return (
			<Dialog title={"Löschen nicht möglich"} onClose={onCancel}>
				Kurs kann nicht gelöscht werden.
				{linkedEntities.subject && (
					<>
						<br />
						Er wird im folgenden Fachgebiet verwendet:{" "}
						<Link
							href={`/subjects/${linkedEntities.subject.slug}`}
							className="hover:text-secondary"
						>
							{linkedEntities.subject.title}
						</Link>
					</>
				)}
				<br />
				Er wird in folgenden Fachgebieten genutzt:
				<ul className="flex flex-wrap gap-4 list-inside list-disc text-sm font-medium">
					{linkedEntities.specializations.map(specialization => (
						<li key={specialization.slug}>
							<Link
								href={`/subjects/${specialization.subject.slug}/${specialization.slug}`}
								className="hover:text-secondary"
							>
								{specialization.subject.title} / {specialization.title}
							</Link>
						</li>
					))}
				</ul>
				<DialogActions onClose={onCancel} />
			</Dialog>
		);
	}

	return (
		<Dialog title={"Löschen"} onClose={onCancel}>
			Möchten Sie diesen Kurs wirklich löschen?
			<DialogActions onClose={onCancel}>
				<button className="btn-primary hover:bg-red-500" onClick={onSubmit}>
					Löschen
				</button>
			</DialogActions>
		</Dialog>
	);
}

function LessonTaskbar({ lesson }: { lesson: LessonWithDraftInfo }) {
	return (
		<div className="flex flex-wrap justify-end gap-4">
			<Link
				href={
					lesson.draftId
						? `/teaching/lessons/edit/draft/${lesson.draftId}`
						: `/teaching/lessons/edit/${lesson.lessonId}`
				}
			>
				<button type="button" className="btn-stroked w-fit self-end">
					<PencilIcon className="icon" />
					<span>Bearbeiten</span>
				</button>
			</Link>
			<LessonDeleteOption lessonId={lesson.lessonId} />
		</div>
	);
}

function LessonDeleteOption({ lessonId }: { lessonId: string }) {
	const { mutateAsync: deleteLesson } = trpc.lesson.deleteLesson.useMutation();
	const { data: linkedEntities, isLoading } = trpc.lesson.findLinkedLessonEntities.useQuery({
		lessonId
	});
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteLesson({ id: lessonId });
	};

	const handleConfirm = () => {
		handleDelete();
		setShowConfirmation(false);
	};

	const handleCancel = () => {
		setShowConfirmation(false);
	};

	// Don't show delete button -> Empty option
	if (isLoading) {
		return <></>;
	}

	return (
		<>
			<button
				className="rounded bg-red-500 font-medium text-white hover:bg-red-600"
				onClick={() => setShowConfirmation(true)}
			>
				<div className="ml-4">
					<TrashIcon className="icon " />
				</div>
			</button>
			{showConfirmation && (
				<LessonDeletionDialog
					handleCancel={handleCancel}
					handleConfirm={handleConfirm}
					linkedEntities={linkedEntities}
				/>
			)}
		</>
	);
}

function LessonDeletionDialog({
	handleCancel,
	handleConfirm,
	linkedEntities
}: {
	handleCancel: () => void;
	handleConfirm: () => void;
	linkedEntities?: { slug: string; title: string }[];
}) {
	if (linkedEntities && linkedEntities.length > 0) {
		return (
			<Dialog title={"Löschen nicht möglich"} onClose={handleCancel}>
				Lerneinheit kann nicht gelöscht werden, da sie in den folgenden Kursen Anwendung
				findet:
				<ul className="flex flex-wrap gap-4 list-inside list-disc text-sm font-medium">
					{linkedEntities.map(course => (
						<li key={course.slug}>
							<Link href={`/courses/${course.slug}`} className="hover:text-secondary">
								{course.title}
							</Link>
						</li>
					))}
				</ul>
				<DialogActions onClose={handleCancel} />
			</Dialog>
		);
	}

	return (
		<Dialog title={"Löschen"} onClose={handleCancel}>
			Möchten Sie diese Lerneinheit wirklich löschen?
			<DialogActions onClose={handleCancel}>
				<button className="btn-primary hover:bg-red-500" onClick={handleConfirm}>
					Löschen
				</button>
			</DialogActions>
		</Dialog>
	);
}

function Lessons({ authorName }: { authorName: string }) {
	const router = useRouter();
	const { title = "", page = 1 } = router.query;

	const { data: lessons } = trpc.lesson.findMany.useQuery(
		{
			page: Number(page),
			title: title as string,
			authorName
		},
		{
			keepPreviousData: true,
			staleTime: 10_000
		}
	);

	const {
		data: drafts,
		isLoading,
		isFetching,
		isError,
		refetch
	} = trpc.lessonDraft.getOverviewByOwner.useQuery({
		username: authorName
	});

	// ensures the drafts will be re-fetched after component is mounted
	useEffect(() => {
		refetch();
	}, [authorName, refetch]);

	let lessonsWithDraftInfo = [] as LessonWithDraftInfo[];

	if (lessons) {
		lessonsWithDraftInfo = convertToLessonWithDraftInfo(lessons.result);
	}

	// prevents using old drafts data
	if (drafts && !isFetching) {
		lessonsWithDraftInfo = addDraftInfo(lessonsWithDraftInfo, drafts);
	}

	if (isLoading) {
		return <div></div>;
	}

	if (isError) {
		return <div>Lerneinheit-Entwürfe konnten nicht geladen werden.</div>;
	}

	return (
		<div className="flex min-h-[200px] flex-col">
			{!lessons ? (
				<LoadingBox />
			) : (
				<>
					<SearchField
						placeholder="Suche nach Lerneinheit"
						value={title}
						onChange={e => {
							router.push(
								{
									query: {
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
								<TableHeaderColumn>Letzte Änderung</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
						{lessonsWithDraftInfo.map(lesson => (
							<tr key={lesson.lessonId}>
								<TableDataColumn>
									<Link
										href={
											lesson.draftId
												? `/teaching/lessons/edit/draft/${lesson.draftId}`
												: `/teaching/lessons/edit/${lesson.lessonId}`
										}
										className="font-medium hover:text-secondary"
									>
										<span className="flex gap-3">
											{lesson.title}
											{lesson.draftId && (
												<ExclamationCircleIcon className="icon h-5 text-red-500 pl-1" />
											)}
										</span>
									</Link>
								</TableDataColumn>
								<TableDataColumn>
									<span className="text-light">
										{formatDateAgo(lesson.updatedAt)}
									</span>
								</TableDataColumn>
								<TableDataColumn>
									<LessonTaskbar lesson={lesson} />
								</TableDataColumn>
							</tr>
						))}
					</Table>

					<Paginator pagination={lessons} url={`${router.route}?title=${title}`} />
				</>
			)}
		</div>
	);
}
