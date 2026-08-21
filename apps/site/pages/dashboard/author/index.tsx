import { ArrowDownTrayIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/solid";
import { TeacherView } from "@self-learning/analysis";
import { withTranslations } from "@self-learning/api";
import { database } from "@self-learning/database";
import {
	AuthorResourceSection,
	GroupDeleteOption,
	GroupLeaveOption,
	I18N_NAMESPACE as NS_FEATURE_TEACHING,
	ParentSkillOverview,
	ExportCourseDialog,
	CourseDeleteOption
} from "@self-learning/teaching";
import {
	Divider,
	I18N_NAMESPACE as NS_UI_COMMON,
	IconTextButton,
	SectionHeader,
	ImageOrPlaceholder
} from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { withAuth } from "@self-learning/util/auth";
import Link from "next/link";
import { GroupRole } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useState } from "react";

type Author = Awaited<ReturnType<typeof getAuthor>>;

type Props = { author: Author };

export function getAuthor(username: string) {
	return database.user.findUniqueOrThrow({
		where: { name: username },
		select: {
			author: {
				select: {
					slug: true,
					displayName: true,
					imgUrl: true,
					courses: {
						orderBy: { title: "asc" },
						select: {
							slug: true,
							title: true,
							subtitle: true,
							imgUrl: true,
							specializations: {
								select: {
									title: true
								}
							}
						}
					}
				}
			},
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
	Array.from(new Set(["common", "pages-dashboard", ...NS_UI_COMMON, ...NS_FEATURE_TEACHING])),
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
	const isAdmin = session.data?.user.role === "ADMIN";
	const userId = session.data?.user.id;
	const canCreate = isAdmin || author.memberships.length > 0;

	// TODO SE: Required by KEE branch, check if this is still needed
	const [viewExportDialog, setViewExportDialog] = useState(false);

	return (
		<CenteredSection className="bg-gray-50">
			{canCreate && (
				<>
					<AuthorResourceSection
						kind="course"
						title={t("My_Courses")}
						subtitle={t("Author_Courses_Subtitle")}
						searchPlaceholder={t("Search_Course_Name")}
						emptyMessage={t("No_Accessible_Courses")}
						createLabel={t("Create_Course")}
						isAdmin={isAdmin}
						canCreate={canCreate}
					/>

					<Divider />

					<AuthorResourceSection
						kind="lesson"
						title={t("My_Lessons")}
						subtitle={t("Author_Lessons_Subtitle")}
						searchPlaceholder={t("Search_Lessons")}
						emptyMessage={t("No_Accessible_Lessons")}
						createLabel={t("Create_Lesson")}
						isAdmin={isAdmin}
						canCreate={canCreate}
					/>

					<Divider />

					<AuthorResourceSection
						kind="specialization"
						title={t("My_Specializations")}
						subtitle={t("Author_Specializations_Subtitle")}
						searchPlaceholder={t("Search_Specializations")}
						emptyMessage={t("No_Accessible_Specializations")}
						isAdmin={isAdmin}
					/>

					<Divider />

					<AuthorResourceSection
						kind="subject"
						title={t("My_Subjects")}
						subtitle={t("Author_Subjects_Subtitle")}
						searchPlaceholder={t("Search_Subjects")}
						emptyMessage={t("No_Accessible_Subjects")}
						isAdmin={isAdmin}
					/>

					<Divider />

					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Skillkarten"
								subtitle="Besitzer der folgenden Skillkarten"
							/>
							<Link href="/skills">
								<button type="button" className="btn-stroked w-fit self-end">
									<PencilIcon className="icon" />
									<span>Skills bearbeiten</span>
								</button>
							</Link>
						</div>
						<ParentSkillOverview />
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
					<SectionHeader title={t("My_Groups")} subtitle={t("My_Groups_Subtitle")} />
					{canCreate && (
						<Link href="/teaching/groups/create" className="mt-4">
							<IconTextButton
								text={t("Create_Group")}
								className="btn-secondary"
								icon={<PlusIcon className="icon h-5" />}
							/>
						</Link>
					)}
				</div>
				<ul className="flex flex-col gap-1 py-4">
					{author.memberships.length === 0 ? (
						<div className="mx-auto flex items-center gap-8">
							<div className="h-32 w-32">
								<VoidSvg />
							</div>
							<div>
								<p className="text-light">{t("No_Group_Membership")}</p>
								<p>{t("Group_Membership_Required")}</p>
							</div>
						</div>
					) : (
						author.memberships.map(membership => (
							<li
								key={membership.group.name}
								className="flex px-4 py-2 w-full items-center justify-between rounded-lg border border-light-border bg-white"
							>
								<Link
									className="text-sm font-medium hover:text-c-primary"
									href={`/teaching/groups/${membership.group.id}`}
								>
									{membership.group.name}
								</Link>
								<div className="flex flex-wrap justify-end gap-4">
									<i className="flex items-center">{membership.role}</i>
									{(isAdmin || membership.role === GroupRole.ADMIN) && (
										<Link href={`/teaching/groups/${membership.group.id}/edit`}>
											<IconTextButton
												icon={<PencilIcon className="h-5 w-5" />}
												text={t("Edit")}
												className="btn-stroked"
												title={t("Edit_Group")}
											/>
										</Link>
									)}
									<GroupLeaveOption group={membership.group} userId={userId} />
									{(isAdmin || membership.role === GroupRole.ADMIN) && (
										<GroupDeleteOption group={membership.group} />
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
