import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { NewCourseEditor, NewCourseFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

type EditCourseProps = {
	course: NewCourseFormModel;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<EditCourseProps>(async (ctx, _) => {
		const courseId = ctx.params?.courseId as string;
		const { locale } = ctx;

		if (!courseId) {
			return {
				notFound: true
			};
		}

		const newCourse = await database.newCourse.findUnique({
			where: { courseId },
			include: {
				authors: {
					select: {
						username: true
					}
				},
				specializations: {
					select: {
						specializationId: true
					}
				},
				subject: {
					select: {
						subjectId: true,
						title: true
					}
				},
				teachingGoals: {
					select: {
						id: true,
						name: true,
						description: true,
						children: true,
						repositoryId: true,
						parents: true
					}
				}
			}
		});

		if (!newCourse) {
			return {
				notFound: true
			};
		}

		const teachingGoals = newCourse.teachingGoals.map(goal => ({
			...goal,
			children: goal.children.map(child => child.id),
			parents: goal.parents.map(parent => parent.id)
		}));

		const courseForProps = {
			...newCourse,
			teachingGoals
		};

		return {
			notFound: !newCourse,
			props: {
				course: courseForProps,
				...(await serverSideTranslations(locale ?? "en", ["common"]))
			}
		};
	})
);

export default function EditCoursePage({ course }: EditCourseProps) {
	const { mutateAsync: updateCourse } = trpc.course.editDynamic.useMutation();
	const router = useRouter();

	function onConfirm(updatedCourse: NewCourseFormModel) {
		async function update() {
			try {
				const { title } = await updateCourse({
					courseId: course.courseId as string,
					course: updatedCourse
				});
				showToast({ type: "success", title: "Änderung gespeichert!", subtitle: title });
				router.replace(router.asPath, undefined, { scroll: false });
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: JSON.stringify(error, null, 2)
				});
			}
		}

		update();
	}

	return <NewCourseEditor course={course} onConfirm={onConfirm} />;
}
