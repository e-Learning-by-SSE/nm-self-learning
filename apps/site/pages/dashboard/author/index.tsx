import { ArrowDownTrayIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { TeacherView } from "@self-learning/analysis";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import {
	GroupDeleteOption,
	GroupLeaveOption,
	SkillRepositoryOverview
} from "@self-learning/teaching";
import {
	Dialog,
	DialogActions,
	Divider,
	I18N_NAMESPACE as NS_UI_COMMON,
	IconOnlyButton,
	IconTextButton,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader
} from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { withAuth } from "@self-learning/util/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { greaterOrEqAccessLevel, Specialization, Subject } from "@self-learning/types";
import { LessonDeleteOption } from "@self-learning/ui/lesson";
import { ExportCourseDialog } from "@self-learning/teaching";
import { AccessLevel, GroupRole } from "@prisma/client";
import { SearchField } from "@self-learning/ui/forms";
import { keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";

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
							children: true,
							members: {
								where: { role: GroupRole.ADMIN },
								select: {
									userId: true
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
	Array.from(new Set(["common", "pages-dashboard", ...NS_UI_COMMON])),
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

function AuthorDashboardPage({ author }: Props) {
	const { t } = useTranslation("pages-dashboard");
	const session = useRequiredSession();
	// const authorName = session.data?.user.name;
	const isAdmin = session.data?.user.role === "ADMIN";
	const userId = session.data?.user.id;

	const [viewExportDialog, setViewExportDialog] = useState(false);
	const [courseFilterName, setCourseFilterName] = useState("");
	const [lessonFilterName, setLessonFilterName] = useState("");
	const [coursePage, setCoursePage] = useState(1);
	const [lessonPage, setLessonPage] = useState(1);

	const { data: courses } = trpc.course.getMyCourses.useQuery(
		{ title: courseFilterName, page: Number(coursePage) },
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	const { data: lessons } = trpc.lesson.getMyLessons.useQuery(
		{ title: lessonFilterName, page: Number(lessonPage) },
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	const canCreate = author.memberships.length > 0;

	return (
		<CenteredSection className="bg-gray-50">
			{canCreate && (
				<>
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title={t("My_Courses")}
								subtitle={t("Author_Courses_Subtitle")}
							/>

							<Link href="/teaching/courses/create" className="mt-4">
								<IconTextButton
									className="btn-secondary"
									text={t("Create_Course")}
									icon={<PlusIcon className="icon h-5" />}
								/>
							</Link>
						</div>

						<SearchField
							placeholder={t("Search_Course_Name")}
							onChange={e => {
								setCourseFilterName(e.target.value);
							}}
						/>

						<ul className="flex flex-col gap-1 py-4">
							{!courses && <LoadingBox />}
							{courses?.result.length === 0 && courseFilterName === "" ? (
								<div className="mx-auto flex items-center gap-8">
									<div className="h-32 w-32">
										<VoidSvg />
									</div>
									<p className="text-c-text-muted">
										{t("No_Accessible_Courses")}
									</p>
								</div>
							) : (
								courses?.result.map(course => (
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

											<div className="flex flex-wrap justify-end gap-4">
												<i className="flex items-center">
													{course.accessLevel}
												</i>
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
															text={t("Edit")}
															className="btn-stroked"
															title={t("Edit_Course")}
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
															text={t("Export")}
															className="btn-stroked"
															title={t("Export_Course")}
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
						{courses?.result && (
							<Paginator
								pagination={courses}
								url={"ignored"}
								onPageChange={setCoursePage}
							/>
						)}
					</section>

					<Divider />

					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title={t("My_Lessons")}
								subtitle={t("Author_Lessons_Subtitle")}
							/>

							<Link href="/teaching/lessons/create" className="mt-4">
								<IconTextButton
									text={t("Create_Lesson")}
									className="btn-secondary"
									icon={<PlusIcon className="icon h-5" />}
								/>
							</Link>
						</div>

						<SearchField
							placeholder={t("Search_Lessons")}
							onChange={e => {
								setLessonFilterName(e.target.value);
							}}
						/>

						<ul className="flex flex-col gap-1 py-4">
							{!lessons && <LoadingBox />}
							{lessons?.result.length === 0 && lessonFilterName === "" ? (
								<div className="mx-auto flex items-center gap-8">
									<div className="h-32 w-32">
										<VoidSvg />
									</div>
									<p className="text-light">
										{t("No_Accessible_Lessons")}
									</p>
								</div>
							) : (
								lessons?.result.map(lesson => (
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
										<LessonTaskbar
											lessonId={lesson.lessonId}
											accessLevel={lesson.accessLevel}
											isAdmin={isAdmin}
										/>
									</li>
								))
							)}
						</ul>
						{lessons?.result && (
							<Paginator
								pagination={lessons}
								url={"ignored"}
								onPageChange={setLessonPage}
							/>
						)}
					</section>

					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title={t("My_Skill_Cards")}
								subtitle={t("Author_Skill_Cards_Subtitle")}
							/>
							<Link href="/skills/repository/create" className="mt-4">
								<IconTextButton
									icon={<PlusIcon className="icon h-5" />}
									className="btn-secondary"
									text={t("Create_Skill_Card")}
								/>
							</Link>
						</div>
						<SkillRepositoryOverview />
					</section>

					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title={t("Participation_Overview")}
								subtitle={t("Participation_Overview_Subtitle")}
							/>
						</div>
						<TeacherView />
						<div className="mb-4" />
					</section>

					<Divider />
				</>
			)}

			<section>
				<div className="flex justify-between gap-4">
					<SectionHeader
						title={t("My_Groups")}
						subtitle={t("My_Groups_Subtitle")}
					/>
					<Link href="/teaching/groups/create" className="mt-4">
						<IconTextButton
							text={t("Create_Group")}
							className="btn-secondary"
							icon={<PlusIcon className="icon h-5" />}
						/>
					</Link>
				</div>
				<ul className="flex flex-col gap-1 py-4">
					{author.memberships.length === 0 ? (
						<div className="mx-auto flex items-center gap-8">
							<div className="h-32 w-32">
								<VoidSvg />
							</div>
							<div>
								<p className="text-light">{t("No_Group_Membership")}</p>
								<p>
									{t("Group_Membership_Required")}
								</p>
							</div>
						</div>
					) : (
						author.memberships.map(m => (
							<li
								key={m.group.name}
								className="flex px-4 py-2 w-full items-center justify-between rounded-lg border border-light-border bg-white"
							>
								<Link
									className="text-sm font-medium hover:text-c-primary"
									href={`/teaching/groups/${m.group.id}`}
								>
									{m.group.name}
								</Link>
								<div className="flex flex-wrap justify-end gap-4">
									<i className="flex items-center">{m.role}</i>
									{(isAdmin || m.role === GroupRole.ADMIN) && (
										<Link href={`/teaching/groups/${m.group.id}/edit`}>
											<IconTextButton
												icon={<PencilIcon className="h-5 w-5" />}
												text={t("Edit")}
												className="btn-stroked"
												title={t("Edit_Group")}
											/>
										</Link>
									)}
									<GroupLeaveOption group={m.group} userId={userId} />
									{(isAdmin || m.role === GroupRole.ADMIN) && (
										<GroupDeleteOption group={m.group} />
									)}
								</div>
							</li>
						))
					)}
				</ul>
			</section>
		</CenteredSection>
	);
}

function CourseDeleteOption({ slug }: { slug: string }) {
	const { mutateAsync: deleteCourse } = trpc.course.deleteCourse.useMutation();
	const { data: linkedEntities, refetch } = trpc.course.findLinkedEntities.useQuery(
		{ slug },
		{ enabled: false }
	); // Prevent DB call on page load
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

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				onClick={async () => {
					await refetch(); // Lazy-load linked entities only when delete is initiated
					setShowConfirmation(true);
				}}
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
	const { t } = useTranslation("pages-dashboard");

	if (linkedEntities && (linkedEntities.subject || linkedEntities.specializations.length > 0)) {
		return (
			<Dialog title={t("Delete_Not_Possible")} onClose={onCancel}>
				{t("Course_Cannot_Be_Deleted")}
				{linkedEntities.subject && (
					<>
						<br />
						{t("Used_In_Subject")} {" "}
						<Link
							href={`/subjects/${linkedEntities.subject.slug}`}
							className="hover:text-c-primary"
						>
							{linkedEntities.subject.title}
						</Link>
					</>
				)}
				<br />
				{t("Used_In_Subjects")}
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
		<Dialog title={t("Delete")} onClose={onCancel}>
			{t("Confirm_Delete_Course")}
			<DialogActions onClose={onCancel}>
				<button className="btn-primary hover:bg-c-danger" onClick={onSubmit}>
					{t("Delete")}
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
	const { t } = useTranslation("pages-dashboard");
	const canDelete = isAdmin || greaterOrEqAccessLevel(accessLevel, AccessLevel.FULL);
	const canEdit = isAdmin || greaterOrEqAccessLevel(accessLevel, AccessLevel.EDIT);
	return (
		<div className="flex flex-wrap justify-end gap-4">
			<i className="flex items-center">{accessLevel}</i>
			{canEdit && (
				<Link href={`/teaching/lessons/edit/${lessonId}`}>
					<IconTextButton
						icon={<PencilIcon className="h-5 w-5" />}
						text={t("Edit")}
						className="btn-stroked"
						title={t("Edit_Lesson")}
					/>
				</Link>
			)}
			{canDelete && <LessonDeleteOption lessonId={lessonId} />}
		</div>
	);
}
