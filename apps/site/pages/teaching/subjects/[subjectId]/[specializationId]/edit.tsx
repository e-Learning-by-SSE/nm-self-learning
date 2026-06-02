import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { ResourceGuard, testResourceGuard } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { SpecializationEditor } from "../create";
import { withTranslations } from "@self-learning/api";
import { resourcePermissionSelect, Specialization, toResourcePermissionsForm } from "@self-learning/types";
import { database } from "@self-learning/database";
import { withAuth } from "@self-learning/util/auth";
import { AccessLevel } from "@prisma/client";
import { useRouter } from "next/router";

type EditSpecializationProps = {
	specialization: Specialization;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<EditSpecializationProps>(async (ctx, user) => {
		const specializationId = ctx.params?.specializationId;

		if (typeof specializationId !== "string") {
			throw new Error("No [specializationId] provided.");
		}

		const specialization = await database.specialization.findUniqueOrThrow({
			where: { specializationId },
			select: {
				specializationId: true,
				subjectId: true,
				slug: true,
				title: true,
				subtitle: true,
				cardImgUrl: true,
				imgUrlBanner: true,
				permissions: {
					select: resourcePermissionSelect
				}
			}
		});

		if (!specialization) {
			return { notFound: true };
		}
		const permissions = toResourcePermissionsForm(specialization.permissions);
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
				specialization: {
					...specialization,
					permissions
				}
			}
		};
	})
);

export default function SpecializationEditPage({ specialization }: EditSpecializationProps) {
	const { mutateAsync: updateSpecialization } = trpc.specialization.update.useMutation();
	const router = useRouter();
	const { subjectId } = specialization;
	const onSubmit: Parameters<typeof SpecializationEditor>[0]["onSubmit"] = async specFromForm => {
		try {
			console.log("Creating specialization", specFromForm);
			const spec = await updateSpecialization({
				subjectId: subjectId as string,
				data: specFromForm
			});

			showToast({ type: "success", title: "Spezialisierung geändert", subtitle: spec.title });
			router.push(`/teaching/subjects/${subjectId}/${spec.specializationId}/edit`);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	};

	return (
		<ResourceGuard
			fallback="unauthorized"
			requiredAccess={AccessLevel.EDIT}
			permittedGroups={specialization.permissions}
		>
			<SpecializationEditor onSubmit={onSubmit} initialSpecialization={specialization} />
		</ResourceGuard>
	);
}
