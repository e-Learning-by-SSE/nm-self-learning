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
	IconTextButton,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { useCallback, useEffect, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";

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

/**
 * AddAuthorDialog - Multi-step dialog to promote a user to author with optional group membership.
 *
 * Usage: Allows admins to add a new author to the system. User selection is required. Optionally adds
 * the author to an existing group or creates a new group for them. Each group membership includes role
 * (ADMIN/MEMBER) and expiration date. Used on the admin authors management page.
 *
 * UI: Steps for user selection -> membership options -> group selection (or new group creation) ->
 * membership details (role, expiration); uses SearchUserDialog and SearchGroupDialog internally
 * Related: SearchUserDialog, SearchGroupDialog, GroupMemberEditor, PromoteRequest
 *
 * @param isOpen - Controls dialog visibility
 * @param onClose - Callback with PromoteRequest (user + optional membership) or undefined if cancelled
 */
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

	const handleGroupNameChange = useCallback(
		(value: string) => {
			setValue("groupName", value);
			setValue("groupSlug", slugify(value));
		},
		[setValue]
	);

	useEffect(() => {
		const groupName = getValues("groupName");

		if (!groupName && user) {
			handleGroupNameChange(`${user.displayName}s Gruppe`);
		}
	}, [user, getValues, handleGroupNameChange]);

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
					<LabeledField label="Benutzer" error={errors.user?.message}>
						{user ? (
							<div className="flex items-center gap-2 p-2 border rounded-lg">
								<ImageOrPlaceholder
									src={user.image ?? undefined}
									className="h-8 w-8 rounded-full"
								/>
								<span>{user.displayName}</span>

								<IconTextButton
									text=""
									icon={<ChevronUpDownIcon className="icon w-5" />}
									onClick={() => setSearchUserOpen(true)}
									className="ml-auto btn-primary"
									title="Benutzer auswählen"
								/>
							</div>
						) : (
							<IconTextButton
								text="Benutzer auswählen"
								icon={<ChevronUpDownIcon className="icon w-5" />}
								onClick={() => setSearchUserOpen(true)}
								className="btn-primary"
							/>
						)}
					</LabeledField>

					{/* Membership toggle */}
					<LabeledField
						label="Auch Gruppe hinzufügen"
						error={errors.doAddMembership?.message}
					>
						<input
							type="checkbox"
							className="checkbox"
							{...register("doAddMembership")}
						/>
					</LabeledField>

					{doAddMembership && (
						<>
							{/* New group toggle */}
							<LabeledField
								label="Neue Gruppe erstellen"
								error={errors.doCreateNewGroup?.message}
							>
								<input
									type="checkbox"
									className="checkbox"
									{...register("doCreateNewGroup")}
								/>
								Neue Gruppe erstellen
							</LabeledField>

							{doCreateNewGroup ? (
								<div className="space-y-2">
									<LabeledField
										label="Gruppenname"
										error={errors.groupName?.message}
									>
										<input
											type="text"
											className="textfield"
											placeholder="Gruppenname"
											{...register("groupName", {
												onChange: e => handleGroupNameChange(e.target.value)
											})}
										/>
									</LabeledField>
									<LabeledField label="Slug" error={errors.groupSlug?.message}>
										<input
											type="text"
											className="textfield"
											placeholder="slug"
											{...register("groupSlug")}
										/>
									</LabeledField>
								</div>
							) : (
								<LabeledField label="Gruppe" error={errors.selectedGroup?.message}>
									{selectedGroup ? (
										<div className="flex items-center gap-2 p-2 border rounded-lg">
											<span>{selectedGroup.name}</span>
											<IconTextButton
												text=""
												icon={<ChevronUpDownIcon className="icon w-5" />}
												onClick={() => setSearchGroupOpen(true)}
												className="ml-auto btn-primary"
												title="Gruppe auswählen"
											/>
										</div>
									) : (
										<IconTextButton
											text="Gruppe auswählen"
											icon={<ChevronUpDownIcon className="icon w-5" />}
											onClick={() => setSearchGroupOpen(true)}
											className="btn-primary"
										/>
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
