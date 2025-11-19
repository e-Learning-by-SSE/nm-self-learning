import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { GroupEditor, GroupFormModel, onGroupCreatorSubmit } from "@self-learning/teaching";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";
import { withTranslations } from "@self-learning/api";

export default function CreateGroupPage() {
	const session = useRequiredSession();
	const authorUsername = session.data?.user.name;
	const isAdmin = session.data?.user.role === "ADMIN";
	const router = useRouter();
	const { mutateAsync: createGroupAsync } = trpc.permission.createGroup.useMutation();
	if (!authorUsername || !isAdmin) {
		return <Unauthorized>Um eine Gruppe zu erstellen, musst du ein Autor sein.</Unauthorized>;
	}

	// This function is triggered when the Editor is closed.
	// It sets the TRPC mutation and the url where the user is directed after submission
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

export const getServerSideProps = withTranslations(["common"]);
