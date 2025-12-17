import { ArrowDownTrayIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { TeacherView } from "@self-learning/analysis";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { SkillRepositoryOverview } from "@self-learning/teaching";
import {
	Divider,
	IconButton,
	ImageChip,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	Dialog,
	DialogActions
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { formatDateAgo } from "@self-learning/util/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { Specialization, Subject } from "@self-learning/types";
import { LessonDeleteOption } from "@self-learning/ui/lesson";
import { ExportCourseDialog } from "@self-learning/teaching";
import { AccessLevel } from "@prisma/client";

type Author = Awaited<ReturnType<typeof getAuthor>>;

type Props = { author: Author };

// TODO MOVE OUT
export function getAuthor(username: string) {
	return database.user.findUniqueOrThrow({
		where: { name: username },
		select: {
			author: {
				select: {
					slug: true,
					displayName: true,
					imgUrl: true
				}
			}, // TODO we want pagination
			memberships: {
				select: {
					role: true,
					group: {
						select: {
							name: true,
							permissions: {
								// where: {
								// 	OR: [{ accessLevel: "FULL" }, { accessLevel: "EDIT" }]
								// },
								select: {
									accessLevel: true,
									course: {
										select: {
											courseId: true,
											title: true,
											slug: true,
											imgUrl: true
										}
									},
									lesson: {
										select: { lessonId: true, title: true, slug: true }
									}
								}
							}
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
			return { props: { author: await getAuthor(user.name) } };
		}

		return { redirect: { destination: "/", permanent: false } };
	})
);

export default function Start(props: Props) {
	return <AuthorDashboardPage {...props} />;
}

type _Base = {
	title: string;
	slug: string;
	accessLevel: AccessLevel;
};
type Course = _Base & {
	courseId: string;
	imgUrl: string | null;
};
type Lesson = _Base & {
	lessonId: string;
};

function AuthorDashboardPage({ author }: Props) {
	// const session = useRequiredSession();
	// const authorName = session.data?.user.name;

	const [viewExportDialog, setViewExportDialog] = useState(false);

	// separate permissions into lessons & courses and get distincts
	const { courses, lessons } = useMemo(() => {
		const courseMap = new Map<string, Course>();
		const lessonMap = new Map<string, Lesson>();
		for (const m of author.memberships) {
			for (const p of m.group.permissions) {
				const accessLevel = p.accessLevel;
				if (p.course) {
					courseMap.set(p.course.courseId, { ...p.course, accessLevel });
				}
				if (p.lesson) {
					lessonMap.set(p.lesson.lessonId, { ...p.lesson, accessLevel });
				}
			}
		}
		return {
			courses: Array.from(courseMap.values()),
			lessons: Array.from(lessonMap.values())
		};
	}, [author.memberships]);

	return (
		<CenteredSection className="bg-gray-50">
			<section>
				<div className="flex justify-between gap-4">
					<SectionHeader
						title="Meine Gruppen"
						subtitle="Mitglied der folgenden Gruppen:"
					/>

					<Link href="/teaching/groups/create">
						<IconButton
							text="Group erstellen"
							icon={<PlusIcon className="icon h-5" />}
						/>
					</Link>
				</div>
				<ul className="flex flex-col gap-4 py-4">
					{author.memberships.length === 0 ? (
						<div className="mx-auto flex items-center gap-8">
							<div className="h-32 w-32">
								<VoidSvg />
							</div>
							<p className="text-light">Sie sind Mitglied keiner Gruppe.</p>
						</div>
					) : (
						author.memberships.map(m => (
							<li
								key={m.group.name}
								className="flex px-4 py-2 w-full items-center justify-between rounded-lg border border-light-border bg-white"
							>
								{m.group.name} als {m.role}
							</li>
						))
					)}
				</ul>
			</section>

			<section>
				<div className="flex justify-between gap-4">
					<SectionHeader title="Meine Kurse" subtitle="Autor der folgenden Kurse:" />

					<Link href="/teaching/courses/create">
						<IconButton
							text="Kurs erstellen"
							icon={<PlusIcon className="icon h-5" />}
						/>
					</Link>
				</div>

				<ul className="flex flex-col gap-4 py-4">
					{courses.length === 0 ? (
						<div className="mx-auto flex items-center gap-8">
							<div className="h-32 w-32">
								<VoidSvg />
							</div>
							<p className="text-light">Du hast noch keine Kurse erstellt.</p>
						</div>
					) : (
						courses.map(course => (
							<li
								key={course.courseId}
								className="flex items-center rounded-lg border border-light-border bg-white"
							>
								<ImageOrPlaceholder
									src={course.imgUrl ?? undefined}
									className="h-16 w-16 rounded-l-lg object-cover"
								/>

								<div className="flex w-full items-center justify-between px-4">
									<Link
										href={`/courses/${course.slug}`}
										className="text-sm font-medium hover:text-secondary"
									>
										{course.title}
									</Link>
									<i>{course.accessLevel}</i>

									<div className="flex flex-wrap justify-end gap-4">
										<Link
											href={`/teaching/courses/edit/${course.courseId}`}
											className="btn-stroked h-fit w-fit"
										>
											<PencilIcon className="icon" />
											<span>Bearbeiten</span>
										</Link>
										<div className="flex space-x-2">
											<button
												className="btn-stroked w-full text-right"
												type="button"
												onClick={() => setViewExportDialog(true)}
											>
												<ArrowDownTrayIcon className="w-5 h-5 icon" />
												{"Export"}
											</button>
										</div>
										<CourseDeleteOption slug={course.slug} />
									</div>
								</div>
								{viewExportDialog && (
									<ExportCourseDialog
										course={course}
										onClose={() => {
											setViewExportDialog(false);
										}}
									/>
								)}
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
						subtitle="Berechtigungen in den folgenden Lerneinheiten:"
					/>

					<Link href="/teaching/lessons/create">
						<IconButton
							text="Lerneinheit erstellen"
							icon={<PlusIcon className="icon h-5" />}
						/>
					</Link>
				</div>

				<ul className="flex flex-col gap-4 py-4">
					{lessons.length === 0 ? (
						<div className="mx-auto flex items-center gap-8">
							<div className="h-32 w-32">
								<VoidSvg />
							</div>
							<p className="text-light">Du hast noch keine Lerneinheiten erstellt.</p>
						</div>
					) : (
						lessons.map(lesson => (
							<li
								key={lesson.lessonId}
								className="flex w-full py-2 items-center justify-between px-4 rounded-lg border border-light-border bg-white"
							>
								<Link
									href={`/lessons/${lesson.slug}`}
									className="font-medium hover:text-secondary"
								>
									{lesson.title}
								</Link>
								<i>{lesson.accessLevel}</i>
								<LessonTaskbar lessonId={lesson.lessonId} />
							</li>
						))
					)}
				</ul>
			</section>

			<Divider />
			<section>
				<div className="flex justify-between gap-4">
					<SectionHeader
						title="Meine Skillkarten"
						subtitle="Autor der folgenden Skillkarten:"
					/>
					<Link href="/skills/repository/create">
						<IconButton
							icon={<PlusIcon className="icon h-5" />}
							text="Skillkarte erstellen"
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
		</CenteredSection>
	);
}

function CourseDeleteOption({ slug }: { slug: string }) {
	const { mutateAsync: deleteCourse } = trpc.course.deleteCourse.useMutation();
	const { data: linkedEntities, isLoading } = trpc.course.findLinkedEntities.useQuery({ slug });
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

function LessonTaskbar({ lessonId }: { lessonId: string }) {
	return (
		<div className="flex flex-wrap justify-end gap-4">
			<Link href={`/teaching/lessons/edit/${lessonId}`}>
				<button type="button" className="btn-stroked w-fit self-end">
					<PencilIcon className="icon" />
					<span>Bearbeiten</span>
				</button>
			</Link>
			<LessonDeleteOption lessonId={lessonId} />
		</div>
	);
}

function Lessons({ authorName }: { authorName: string }) {
	const router = useRouter();
	const { title = "", page = 1 } = router.query;

	const { data: lessons } = trpc.lesson.findMany.useQuery(
		{ page: Number(page), title: title as string, authorName },
		{ keepPreviousData: true, staleTime: 10_000 }
	);

	return (
		<div className="flex min-h-[200px] flex-col">
			{!lessons ? (
				<LoadingBox />
			) : (
				<>
					<SearchField
						placeholder="Suche nach Lerneinheiten"
						value={title}
						onChange={e => {
							router.push({ query: { title: e.target.value, page: 1 } }, undefined, {
								shallow: true
							});
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
						{lessons.result.map(lesson => (
							<tr key={lesson.lessonId}>
								<TableDataColumn>
									<Link
										href={`/lessons/${lesson.slug}`}
										className="font-medium hover:text-secondary"
									>
										{lesson.title}
									</Link>
								</TableDataColumn>
								<TableDataColumn>
									<span className="text-light">
										{formatDateAgo(lesson.updatedAt)}
									</span>
								</TableDataColumn>
								<TableDataColumn>
									<LessonTaskbar lessonId={lesson.lessonId} />
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
