import { getGroup, hasGroupRole, withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { GroupEditor, GroupFormModel } from "@self-learning/teaching";
import { OnDialogCloseFn, showToast } from "@self-learning/ui/common";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ResourceAccessFormSchema } from "@self-learning/types";
import { GroupRole } from "@prisma/client";

type EditGroupProps = {
	group: GroupFormModel;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<EditGroupProps>(async (ctx, user) => {
		if (!ctx.params?.groupId) {
			return {
				notFound: true
			};
		}

		const groupId = parseInt(ctx.params?.groupId as string);
		const { locale } = ctx;

		// verify if can edit this group
		if (!(user.role === "ADMIN") && !(await hasGroupRole(groupId, user.id, GroupRole.MEMBER))) {
			return {
				redirect: {
					destination: "/403",
					permanent: false
				}
			};
		}

		const group = await getGroup(groupId);

		if (!group) {
			return {
				notFound: true
			};
		}

		// ensure type safesty
		const permissions = group.permissions.map(p => ResourceAccessFormSchema.parse(p));

		return {
			notFound: !group,
			props: {
				group: { ...group, permissions },
				...(await serverSideTranslations(locale ?? "en", ["common"]))
			}
		};
	})
);

export default function EditGroupPage({ group }: EditGroupProps) {
	const { mutateAsync: updateGroup } = trpc.permission.updateGroup.useMutation();
	const router = useRouter();

	const handleEditClose: OnDialogCloseFn<GroupFormModel> = async updatedGroup => {
		async function update() {
			try {
				if (updatedGroup) {
					const { name } = await updateGroup(updatedGroup);
					showToast({ type: "success", title: "Änderung gespeichert!", subtitle: name });
				}
				router.replace(router.asPath, undefined, { scroll: false });
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: JSON.stringify(error, null, 2)
				});
			}
		}
		await update();
	};

	return <GroupEditor initialGroup={group} onSubmit={handleEditClose} />;
}
