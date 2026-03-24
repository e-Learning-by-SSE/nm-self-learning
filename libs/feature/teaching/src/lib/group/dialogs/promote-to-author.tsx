import {
	GroupMemberEditor,
	GroupSearchEntry,
	MemberFormModel,
	SearchGroupDialog
} from "@self-learning/teaching";
import { slugify } from "@self-learning/util/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useForm } from "react-hook-form";

import { GroupRole } from "@prisma/client";
import { SearchUserDialog, UserSearchEntry } from "@self-learning/admin";
import {
	Dialog,
	DialogActions,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { useState } from "react";

export type PromoteRequest = {
	user: UserSearchEntry;
	membership?: {
		role: GroupRole;
		expiresAt: Date | null;
		group: { id: number } | { name: string; slug: string };
	};
};

type MembershipGroup = NonNullable<PromoteRequest["membership"]>["group"];

type AddAuthorForm = {
	user: UserSearchEntry | null;
	doAddMembership: boolean;
	doCreateNewGroup: boolean;
	// Group selection branch
	selectedGroup: GroupSearchEntry | null;
	// New group branch
	groupName: string;
	groupSlug: string;
	// Membership editor
	membership: MemberFormModel;
};

const ADD_AUTHOR_DEFAULTS: AddAuthorForm = {
	user: null,
	doAddMembership: false,
	doCreateNewGroup: false,
	selectedGroup: null,
	groupName: "",
	groupSlug: "",
	membership: {
		role: GroupRole.MEMBER,
		expiresAt: null,
		user: {
			id: "",
			displayName: null,
			email: null,
			author: null
		}
	}
};

export function AddAuthorDialog({
	isOpen,
	onClose
}: {
	isOpen: boolean;
	onClose: OnDialogCloseFn<PromoteRequest>;
}) {
	// UI-only state — not form data
	const [isSearchUserOpen, setSearchUserOpen] = useState(false);
	const [isSearchGroupOpen, setSearchGroupOpen] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors }
	} = useForm<AddAuthorForm>({ defaultValues: ADD_AUTHOR_DEFAULTS });

	const [user, doAddMembership, doCreateNewGroup, selectedGroup, membership] = watch([
		"user",
		"doAddMembership",
		"doCreateNewGroup",
		"selectedGroup",
		"membership"
	]);

	function onUserSelected(entry?: UserSearchEntry) {
		setValue("user", entry ?? null);
		setSearchUserOpen(false);
	}

	function onGroupSelected(entry?: GroupSearchEntry) {
		setValue("selectedGroup", entry ?? null);
		setSearchGroupOpen(false);
	}

	function handleGroupNameChange(value: string) {
		setValue("groupName", value);
		setValue("groupSlug", slugify(value));
	}

	function onSubmit(data: AddAuthorForm) {
		if (!data.user) {
			showToast({
				type: "error",
				title: "Autor nicht hinzugefügt",
				subtitle: "Kein Benutzer ausgewählt"
			});
			return;
		}

		const res: PromoteRequest = { user: data.user };

		if (data.doAddMembership || data.doCreateNewGroup) {
			const group: MembershipGroup | null = data.doCreateNewGroup
				? data.groupName && data.groupSlug
					? { name: data.groupName, slug: data.groupSlug }
					: null
				: data.selectedGroup
					? { id: data.selectedGroup.groupId }
					: null;

			if (!group) {
				showToast({
					type: "error",
					title: "Autor nicht hinzugefügt",
					subtitle: data.doCreateNewGroup
						? "Details für neue Gruppe fehlen"
						: "Keine Gruppe ausgewählt"
				});
				return;
			}

			res.membership = {
				group,
				expiresAt: data.membership.expiresAt,
				role: data.membership.role
			};
		}

		onClose(res);
	}

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<form onSubmit={handleSubmit(onSubmit)} className="p-4 overflow-auto">
				<h2 className="text-xl font-semibold mb-4">Autor hinzufügen</h2>
				<div className="space-y-4">
					{/* User selection */}
					<LabeledField label="Benutzer">
						{user ? (
							<div className="flex items-center gap-2 p-2 border rounded-lg">
								<ImageOrPlaceholder
									src={user.image ?? undefined}
									className="h-8 w-8 rounded-full"
								/>
								<span>{user.displayName}</span>
								<button
									type="button"
									className="ml-auto btn-stroked text-xs"
									onClick={() => setSearchUserOpen(true)}
								>
									Ändern
								</button>
							</div>
						) : (
							<button
								type="button"
								className="btn-primary"
								onClick={() => setSearchUserOpen(true)}
							>
								Benutzer auswählen
							</button>
						)}
					</LabeledField>

					{/* Membership toggle */}
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							className="checkbox"
							{...register("doAddMembership")}
						/>
						Auch Gruppe hinzufügen
					</label>

					{doAddMembership && (
						<>
							{/* New group toggle */}
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									className="checkbox"
									{...register("doCreateNewGroup")}
								/>
								Neue Gruppe erstellen
							</label>

							{doCreateNewGroup ? (
								<div className="space-y-2">
									<LabeledField label="Gruppenname">
										<input
											type="text"
											className="textfield"
											placeholder="Gruppenname"
											{...register("groupName", {
												onChange: e => handleGroupNameChange(e.target.value)
											})}
										/>
									</LabeledField>
									<LabeledField label="Slug">
										<input
											type="text"
											className="textfield"
											placeholder="slug"
											{...register("groupSlug")}
										/>
									</LabeledField>
								</div>
							) : (
								<LabeledField label="Gruppe">
									{selectedGroup ? (
										<div className="flex items-center gap-2 p-2 border rounded-lg">
											<span>{selectedGroup.name}</span>
											<button
												type="button"
												className="ml-auto btn-stroked text-xs"
												onClick={() => setSearchGroupOpen(true)}
											>
												Ändern
											</button>
										</div>
									) : (
										<button
											type="button"
											className="btn-primary"
											onClick={() => setSearchGroupOpen(true)}
										>
											Gruppe auswählen
										</button>
									)}
								</LabeledField>
							)}

							<GroupMemberEditor
								member={membership}
								onChange={value => {
									setValue("membership", {
										...getValues("membership"),
										...value
									});
								}}
								onlyAdmin={doCreateNewGroup}
							/>
						</>
					)}

					<DialogActions onClose={onClose}>
						<button type="submit" className="btn-primary">
							Speichern
						</button>
					</DialogActions>
				</div>
			</form>

			{isSearchUserOpen && (
				<SearchUserDialog open={isSearchUserOpen} onClose={onUserSelected} />
			)}
			{isSearchGroupOpen && (
				<SearchGroupDialog
					isOpen={isSearchGroupOpen}
					onClose={onGroupSelected}
					isGlobalSearch
				/>
			)}
		</Dialog>
	);
}
