import { ArrowDownTrayIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { TeacherView } from "@self-learning/analysis";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { SkillRepositoryOverview } from "@self-learning/teaching";
import { Specialization, Subject } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	Divider,
	IconOnlyButton,
	IconTextButton,
	ImageChip,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { withAuth } from "@self-learning/util/auth";
import { formatDateAgo } from "@self-learning/util/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { LessonDeleteOption } from "@self-learning/ui/lesson";
import { ExportCourseDialog } from "@self-learning/teaching";

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

	const [viewExportDialog, setViewExportDialog] = useState(false);

	return (
		<div>
			<CenteredSection>
				<div className="flex flex-col gap-10">
					{author.subjectAdmin.length > 0 && (
						<>
							<section>
								<SectionHeader
									title="Fachgebiete"
									subtitle="Administrator der folgenden Fachgebiete:"
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
									subtitle="Administrator der folgenden Spezialisierungen:"
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
								subtitle="Autor der folgenden Kurse:"
							/>

							<Link href="/teaching/courses/create" className="mt-4">
								<button className="btn btn-primary" type="button">
									<span>Kurs erstellen</span>
								</button>
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
												>
													<IconTextButton
														icon={<PencilIcon className="h-5 w-5" />}
														text={"Bearbeiten"}
														variant="stroked"
														title="Kurs bearbeiten"
													/>
												</Link>
												<IconTextButton
													icon={<ArrowDownTrayIcon className="h-5 w-5" />}
													text={"Export"}
													variant="stroked"
													title="Kurs exportieren"
													onClick={() => setViewExportDialog(true)}
												/>
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
								subtitle="Autor der folgenden Lerneinheiten:"
							/>

							<Link href="/teaching/lessons/create" className="mt-4">
								<button className="btn btn-primary" type="button">
									<span>Lerneinheit erstellen</span>
								</button>
							</Link>
						</div>

						{authorName && <Lessons authorName={authorName} />}
					</section>

					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Meine Skillkarten"
								subtitle="Autor der folgenden Skillkarten:"
							/>
							<Link href="/skills/repository/create" className="mt-4">
								<button className="btn btn-primary" type="button">
									<span>Skillkarte erstellen</span>
								</button>
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
				variant="danger"
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
				<IconTextButton
					icon={<PencilIcon className="h-5 w-5" />}
					text={"Bearbeiten"}
					variant="stroked"
					title="Lerneinheit bearbeiten"
				/>
			</Link>

			<LessonDeleteOption lessonId={lessonId} />
		</div>
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
