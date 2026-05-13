import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Dialog, DialogActions, IconTextButton, showToast } from "@self-learning/ui/common";
import { useRouter } from "next/router";
import { useState } from "react";

export function GroupLeaveOption({
	group,
	userId
}: {
	userId?: string;
	group: { id: number; name: string; members: { userId: string }[] };
}) {
	const { mutateAsync: leaveGroup } = trpc.permission.leaveGroup.useMutation({
		onSuccess: () => {
			showToast({
				type: "success",
				title: "Gruppe verlassen",
				subtitle: `Sie haben die Gruppe ${group.name} verlassen.`
			});
			reload();
		},
		onError: () => {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: `Die Gruppe ${group.name} konnte nicht verlassen werden.`
			});
		}
	});
	const [showConfirmation, setShowConfirmation] = useState(false);
	const { reload } = useRouter();

	async function handleLeave() {
		setShowConfirmation(false);
		try {
			await leaveGroup({ groupId: group.id });
		} catch (error) {
			// Error handling is done in the mutation options
			console.log(error);
		}
	}

	function handleCancel() {
		setShowConfirmation(false);
	}

	const notPossible = group.members.length <= 1 && group.members[0].userId === userId;

	return (
		<>
			<IconTextButton
				icon={<ArrowRightStartOnRectangleIcon className="h-5 w-5" />}
				text="Verlassen"
				className="btn-danger"
				onClick={() => setShowConfirmation(true)}
			/>
			{showConfirmation && (
				<Dialog title={"Gruppe verlassen"} onClose={handleCancel}>
					{!notPossible && (
						<>
							Möchten Sie die Gruppe {group.name} wirklich verlassen?
							<DialogActions onClose={handleCancel}>
								<button
									className="btn-danger hover:bg-c-danger"
									onClick={handleLeave}
								>
									Gruppe verlassen
								</button>
							</DialogActions>
						</>
					)}
					{notPossible && (
						<>
							Sie können die Gruppe nicht verlassen, da Sie der einzige Administrator
							sind.
							<DialogActions onClose={handleCancel} />
						</>
					)}
				</Dialog>
			)}
		</>
	);
}
