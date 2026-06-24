import { canCreate } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { GroupEditor, GroupFormModel, onGroupCreatorSubmit } from "@self-learning/teaching";
import { LoadingBox } from "@self-learning/ui/common";
import { Unauthorized, useCanCreate, useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";

export default function CreateGroupPage() {
	const session = useRequiredSession();
	const canCreateResource = useCanCreate();
	const router = useRouter();
	const { mutateAsync: createGroupAsync } = trpc.permission.createGroup.useMutation();

	if (session.status === "loading") {
		return <LoadingBox />;
	}

	if (!canCreateResource) {
		return (
			<Unauthorized>
				Um eine Gruppe zu erstellen, musst du Mitglied einer Gruppe sein.
			</Unauthorized>
		);
	}

	async function handleCreateClose(group?: GroupFormModel) {
		await onGroupCreatorSubmit(
			() => {
				router.back();
			},
			createGroupAsync,
			group
		);
	}

	return <GroupEditor onSubmit={handleCreateClose} />;
}

export const getServerSideProps = withTranslations(
	["common"],
	withAuth(async (_ctx, user) => {
		if (!(await canCreate(user))) {
			return { redirect: { destination: "/403", permanent: false } };
		}
		return { props: {} };
	})
);
