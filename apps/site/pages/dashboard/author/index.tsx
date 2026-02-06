import { ArrowDownTrayIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { TeacherView } from "@self-learning/analysis";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { SkillRepositoryOverview } from "@self-learning/teaching";
import {
	Dialog,
	DialogActions,
	Divider,
	IconOnlyButton,
	IconTextButton,
	ImageOrPlaceholder,
	SectionHeader
} from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { withAuth } from "@self-learning/util/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { greaterOrEqAccessLevel, Specialization, Subject } from "@self-learning/types";
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
							id: true,
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
	const session = useRequiredSession();
	// const authorName = session.data?.user.name;
	const isAdmin = session.data?.user.role === "ADMIN";

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

	const canCreate = author.memberships.length > 0;

	return (
		<CenteredSection className="bg-gray-50">
			<section>
				<div className="flex justify-between gap-4">
					<SectionHeader
						title="Meine Gruppen"
						subtitle="Mitglied der folgenden Gruppen:"
					/>

					<Link href="/teaching/groups/create">
						<IconTextButton
							text="Group erstellen"
							className="btn-secondary"
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
							<div>
								<p className="text-light">Sie sind Mitglied keiner Gruppe.</p>
								<p>
									Um Inhalte zu erstellen, müssen Sie Mitglied von mindestens
									einer Gruppe sein.
								</p>
							</div>
						</div>
					) : (
						author.memberships.map(m => (
							<li
								key={m.group.name}
								className="flex px-4 py-2 w-full items-center rounded-lg border border-light-border bg-white"
							>
								<Link
									className="text-sm font-medium hover:text-c-primary"
									href={`/teaching/groups/${m.group.id}`}
								>
									{m.group.name}
								</Link>
								<span className="pl-2">als {m.role}</span>
							</li>
						))
					)}
				</ul>
			</section>

			{canCreate && (
				<>
					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Meine Kurse"
								subtitle="Berechtigungen in den folgenden Kurse:"
							/>

							<Link href="/teaching/courses/create" className="mt-4">
								<IconTextButton
									className="btn-secondary"
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
									<p className="text-c-text-muted">
										Du hast noch keine Kurse erstellt.
									</p>
								</div>
							) : (
								courses.map(course => (
									<li
										key={course.courseId}
										className="flex items-center rounded-lg border border-c-border bg-white"
									>
										<ImageOrPlaceholder
											src={course.imgUrl ?? undefined}
											className="h-16 w-16 rounded-l-lg object-cover"
										/>

										<div className="flex w-full items-center justify-between px-4">
											<Link
												href={`/courses/${course.slug}`}
												className="text-sm font-medium hover:text-c-primary"
											>
												{course.title}
											</Link>
											<i>{course.accessLevel}</i>

											<div className="flex flex-wrap justify-end gap-4">
												{(isAdmin ||
													greaterOrEqAccessLevel(
														course.accessLevel,
														AccessLevel.EDIT
													)) && (
													<Link
														href={`/teaching/courses/edit/${course.courseId}`}
													>
														<IconTextButton
															icon={
																<PencilIcon className="h-5 w-5" />
															}
															text={"Bearbeiten"}
															className="btn-stroked"
															title="Kurs bearbeiten"
														/>
													</Link>
												)}
												{(isAdmin ||
													greaterOrEqAccessLevel(
														course.accessLevel,
														AccessLevel.FULL
													)) && (
													<>
														<IconTextButton
															icon={
																<ArrowDownTrayIcon className="h-5 w-5" />
															}
															text={"Export"}
															className="btn-stroked"
															title="Kurs exportieren"
															onClick={() =>
																setViewExportDialog(true)
															}
														/>
														<CourseDeleteOption slug={course.slug} />
													</>
												)}
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

							<Link href="/teaching/lessons/create" className="mt-4">
								<IconTextButton
									text="Lerneinheit erstellen"
									className="btn-secondary"
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
									<p className="text-light">
										Du hast noch keine Lerneinheiten erstellt.
									</p>
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
										<LessonTaskbar
											lessonId={lesson.lessonId}
											accessLevel={lesson.accessLevel}
											isAdmin={isAdmin}
										/>
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
							<Link href="/skills/repository/create" className="mt-4">
								<IconTextButton
									icon={<PlusIcon className="icon h-5" />}
									className="btn-secondary"
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
				</>
			)}
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
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				onClick={() => setShowConfirmation(true)}
			/>
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
							className="hover:text-c-primary"
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
								className="hover:text-c-primary"
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
				<button className="btn-primary hover:bg-c-danger" onClick={onSubmit}>
					Löschen
				</button>
			</DialogActions>
		</Dialog>
	);
}

function LessonTaskbar({
	lessonId,
	accessLevel,
	isAdmin
}: {
	lessonId: string;
	accessLevel: AccessLevel;
	isAdmin: boolean;
}) {
	const canDelete = isAdmin || greaterOrEqAccessLevel(accessLevel, AccessLevel.FULL);
	const canEdit = isAdmin || greaterOrEqAccessLevel(accessLevel, AccessLevel.EDIT);
	return (
		<div className="flex flex-wrap justify-end gap-4">
			{canEdit && (
				<Link href={`/teaching/lessons/edit/${lessonId}`}>
					<IconTextButton
						icon={<PencilIcon className="h-5 w-5" />}
						text={"Bearbeiten"}
						className="btn-stroked"
						title="Lerneinheit bearbeiten"
					/>
				</Link>
			)}
			{canDelete && <LessonDeleteOption lessonId={lessonId} />}
		</div>
	);
}
