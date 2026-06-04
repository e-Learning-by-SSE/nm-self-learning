import { TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Dialog, DialogActions, IconOnlyButton, showToast } from "@self-learning/ui/common";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "libs/data-access/api/src/lib/trpc/app.router";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SingleOwnedResources = inferProcedureOutput<
	AppRouter["permission"]["getSingleOwnedResources"]
>;

export function GroupDeleteOption({
	group
}: {
	group: { id: number; name: string; children: { id: number; name: string }[] };
}) {
	const router = useRouter();
    const query = trpc.permission.getSingleOwnedResources.useQuery(
		{ groupId: group.id },
		{
			enabled: false
		}
	);
	const { mutateAsync: deleteGroup } = trpc.permission.deleteGroup.useMutation({
		onSuccess: () => {
			showToast({
				type: "success",
				title: "Gruppe gelöscht",
				subtitle: `Sie haben die Gruppe ${group.name} gelöscht.`
			});
			router.back();
		},
		onError: () => {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: `Die Gruppe ${group.name} konnte nicht gelöscht werden`
			});
		},
	});
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteGroup({ groupId: group.id });
	};

	async function onClose(isDelete?: boolean) {
		if (isDelete) {
			await handleDelete();
		}
		setShowConfirmation(false);
	}

	async function handleClick() {
		const { data } = await query.refetch();
		if (!data) return; // handle error / empty case
		setShowConfirmation(true);
	}

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				onClick={handleClick}
			/>
			{showConfirmation && (
				<GroupDeleteDialog onClose={onClose} group={group} data={query.data} />
			)}
		</>
	);
}

function GroupDeleteDialog({
	group,
	data,
	onClose
}: {
	group: { id: number; name: string; children: { id: number; name: string }[] };
	data: SingleOwnedResources | undefined;
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
	if (data && data.length > 0) {
		return (
			<Dialog title="Löschen nicht möglich" onClose={onClose}>
				<div className="overflow-auto">
					<p className="mb-4">
						Die Gruppe hat exklusiven Zugriff auf die folgenden Ressourcen:
					</p>

					<div className="flex flex-col gap-2">
						{data?.map((resource, idx) => (
							<div
								key={idx}
								className="flex flex-col gap-1 p-2 border rounded bg-gray-50"
							>
								{resource.lesson && (
									<div className="flex items-center gap-2">
										<span className="font-semibold">Lerneinheit:</span>
										<Link
											href={`/teaching/lessons/edit/${resource.lesson.lessonId}`}
											className="text-c-primary hover:underline"
										>
											{resource.lesson.title}
										</Link>
									</div>
								)}

								{resource.course && (
									<div className="flex items-center gap-2">
										<span className="font-semibold">Kurs:</span>
										<Link
											href={`/teaching/courses/edit/${resource.course.courseId}`}
											className="text-c-primary hover:underline"
										>
											{resource.course.title}
										</Link>
									</div>
								)}
							</div>
						))}
					</div>

					<DialogActions onClose={onClose} />
				</div>
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
