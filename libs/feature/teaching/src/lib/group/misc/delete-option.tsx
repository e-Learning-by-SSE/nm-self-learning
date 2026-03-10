import { TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Dialog, DialogActions, IconOnlyButton } from "@self-learning/ui/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export function GroupDeleteOption({
	group
}: {
	group: { id: number; name: string; children: { id: number; name: string }[] };
}) {
	const { mutateAsync: deleteGroup } = trpc.permission.deleteGroup.useMutation();
	const [showConfirmation, setShowConfirmation] = useState(false);
	const { reload } = useRouter();

	const handleDelete = async () => {
		await deleteGroup({ groupId: group.id });
		// Refresh page
		reload();
	};

	async function onClose(isDelete?: boolean) {
		if (isDelete) {
			await handleDelete();
		}
		setShowConfirmation(false);
	}

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				onClick={() => setShowConfirmation(true)}
			/>
			{showConfirmation && <GroupDeleteDialog onClose={onClose} group={group} />}
		</>
	);
}

function GroupDeleteDialog({
	group,
	onClose
}: {
	group: { id: number; name: string; children: { id: number; name: string }[] };
	onClose: (isDelete?: boolean) => void;
}) {
	if (group.children && group.children.length > 0) {
		return (
			<Dialog title={"Löschen nicht möglich"} onClose={onClose}>
				Die Gruppe wird in folgenden Gruppen als Hauptgruppe aufgeführt:
				{group.children.map(child => (
					<Link
						key={child.id}
						href={`/groups/${child.id}`}
						className="hover:text-c-primary"
					>
						{child.name}
					</Link>
				))}
				<DialogActions onClose={onClose} />
			</Dialog>
		);
	}

	return (
		<Dialog title={"Löschen"} onClose={onClose}>
			Möchten Sie diese Gruppe wirklich löschen?
			<DialogActions onClose={onClose}>
				<button className="btn-primary hover:bg-c-danger" onClick={() => onClose(true)}>
					Löschen
				</button>
			</DialogActions>
		</Dialog>
	);
}
