import { trpc } from "@self-learning/api-client";
import { SubjectEditor } from "@self-learning/teaching";
import { Subject, subjectSchema } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { withTranslations } from "@self-learning/api";
import { withAuth } from "@self-learning/util/auth";
import { database } from "@self-learning/database";
import { ResourceGuard, testResourceGuard } from "@self-learning/ui/layouts";
import { AccessLevel } from "@prisma/client";

type EditSubjectProps = {
	subject: Subject;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<EditSubjectProps>(async (ctx, user) => {
		const subjectId = ctx.params?.subjectId;

		if (typeof subjectId !== "string") {
			throw new Error("No [subjectId] provided.");
		}

		const subject = await database.subject.findUnique({
			where: { subjectId },
			select: {
				subjectId: true,
				slug: true,
				title: true,
				subtitle: true,
				cardImgUrl: true,
				imgUrlBanner: true,
				permissions: {
					select: {
						accessLevel: true,
						group: {
							select: {
								id: true,
								name: true
							}
						}
					}
				},
				specializations: {
					orderBy: { title: "asc" },
					include: {
						specializationAdmin: {
							orderBy: { author: { displayName: "asc" } },
							select: {
								author: {
									select: {
										username: true,
										slug: true,
										displayName: true,
										imgUrl: true
									}
								}
							}
						}
					}
				}
			}
		});

		if (!subject) {
			return { notFound: true };
		}
		const permissions = subject.permissions.map(p => ({
			accessLevel: p.accessLevel,
			groupId: p.group.id,
			groupName: p.group.name
		}));
		const hasAccess = testResourceGuard(user, AccessLevel.EDIT, permissions);
		if (!hasAccess) {
			return {
				redirect: {
					destination: "/403",
					permanent: false
				}
			};
		}

		return {
			props: {
				subject: {
					...subject,
					permissions
				}
			}
		};
	})
);

export default function SubjectEditPage({ subject }: EditSubjectProps) {
	const { mutateAsync: updateSubject } = trpc.subject.update.useMutation();

	async function onSubmit(subjectFromForm: Subject) {
		try {
			console.log("Updating subject", subjectFromForm);
			const res = await updateSubject(subjectFromForm);
			showToast({
				type: "success",
				title: "Fachgebiet aktualisiert",
				subtitle: `Das Fachgebiet "${res.title}" wurde aktualisiert.`
			});
		} catch (error) {
			console.error("Error updating subject", error);
		}
	}

	return (
		<div className="flex flex-col">
			<ResourceGuard
				fallback="unauthorized"
				requiredAccess={AccessLevel.EDIT}
				permittedGroups={subject.permissions}
			>
				<SubjectEditor initialSubject={subjectSchema.parse(subject)} onSubmit={onSubmit} />
			</ResourceGuard>
		</div>
	);
}
