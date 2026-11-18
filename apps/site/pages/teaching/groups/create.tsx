import { canCreate } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	GroupEditor,
	GroupFormModel,
	onGroupCreatorSubmit,
	I18N_NAMESPACE as NS_TEACHING
} from "@self-learning/teaching";
import { LoadingBox } from "@self-learning/ui/common";
import { Unauthorized, useCanCreate, useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth/server";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";

export default function CreateGroupPage() {
	const { t } = useTranslation("feature-teaching");
	const session = useRequiredSession();
	const canCreateResource = useCanCreate();
	const router = useRouter();
	const { mutateAsync: createGroupAsync } = trpc.permission.createGroup.useMutation();

	if (session.status === "loading") {
		return <LoadingBox />;
	}

	if (!canCreateResource) {
		return <Unauthorized>{t("Create_Group_Requires_Membership")}</Unauthorized>;
	}

	async function handleCreateClose(group?: GroupFormModel) {
		await onGroupCreatorSubmit(
			() => {
				router.back();
			},
			createGroupAsync,
			group,
			(key: string) => t(key)
		);
	}

	return <GroupEditor onSubmit={handleCreateClose} />;
}

export const getServerSideProps = withTranslations(
	Array.from(new Set(["common", ...NS_TEACHING])),
	withAuth(async (_ctx, user) => {
		if (!(await canCreate(user))) {
			return { redirect: { destination: "/403", permanent: false } };
		}
		return { props: {} };
	})
);
