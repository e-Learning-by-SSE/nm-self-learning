"use client";
import { Combobox, ComboboxOption } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { SearchUserDialog, UserSearchEntry } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import {
	Chip,
	DropdownDialog,
	IconTextButton,
	OnDialogCloseFn,
	Paginator
} from "@self-learning/ui/common";
import { keepPreviousData } from "@tanstack/react-query";
import { Fragment, useState } from "react";

export type GroupSearchEntry = {
	groupId: number;
	name: string;
	slug: string | null;
	members: string[];
};

/**
 * SearchGroupDialog - Modal for searching and selecting groups from a combobox list.
 *
 * Usage: Renders a dropdown dialog where users can search groups by name, filter by members,
 * and select a group. Uses pagination.
 *
 * UI: Combobox with search input, member filter chips, pagination controls, and option list.
 * Related: SearchUserDialog, GroupPicker (simpler wrapper for pick and display), DropdownDialog
 *
 * @param isOpen - Controls dialog visibility
 * @param isGlobalSearch - If true, shows all groups; if false, only user's groups
 * @param exclude - Group IDs to hide from the list (e.g., to avoid self-reference)
 * @param onClose - Callback fires with selected GroupSearchEntry or undefined if dismissed
 */
export function SearchGroupDialog({
	isOpen,
	isGlobalSearch,
	exclude,
	onClose
}: {
	isOpen: boolean;
	isGlobalSearch: boolean;
	exclude?: number[];
	onClose: OnDialogCloseFn<GroupSearchEntry>;
}) {
	const [filterName, setFilterName] = useState("");
	// const [filterSlug, setFilterSlug] = useState("");
	const [page, setPage] = useState(1);
	const [addMemberDialog, setMemberDialog] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<UserSearchEntry[]>([]);
	const members = selectedUsers.map(u => u.id);

	const [checkGlobalSearch, setGlobalSearch] = useState(isGlobalSearch);

	function onAddMember(user?: UserSearchEntry): void {
		setMemberDialog(false);

		if (user && !selectedUsers.find(u => u.id === user.id)) {
			setSelectedUsers(prev => [...prev, user]);
		}
	}

	function onRemoveMember(userId: string): void {
		setSelectedUsers(prev => prev.filter(u => u.id !== userId));
	}

	const { data: groups } = trpc.permission.findGroups.useQuery(
		{
			page,
			name: filterName,
			members,
			exclude,
			isGlobal: isGlobalSearch && checkGlobalSearch
		},
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	return (
		<DropdownDialog.Dialog open={isOpen} onClose={onClose}>
			<Combobox value={null}>
				<DropdownDialog.SearchInput
					filter={filterName}
					setFilter={setFilterName}
					placeholder="Suche nach Gruppe"
				/>
				<div className="mt-4 flex items-center flex-wrap gap-2 px-4">
					{selectedUsers.map(user => (
						<Chip
							key={user.id}
							onRemove={() => onRemoveMember(user.id)}
							displayImage={false}
							// imgUrl={user.image}
						>
							{user.displayName}
							<span className="text-sm text-light">{user.email}</span>
						</Chip>
					))}
					<IconTextButton
						icon={<PlusIcon className="icon h-5" />}
						text={"Add member to search"}
						className="btn-primary"
						title="Add member to search1"
						onClick={() => setMemberDialog(true)}
					/>
					{addMemberDialog && (
						<SearchUserDialog open={addMemberDialog} onClose={onAddMember} />
					)}
				</div>
				{isGlobalSearch && (
					<div className="mt-4 flex items-center flex-wrap gap-2 px-4">
						<input
							type="checkbox"
							checked={!checkGlobalSearch}
							onChange={e => setGlobalSearch(!e.target.checked)}
							className="checkbox"
						/>
						<label className="text-light">Nur meine Gruppen anzeigen</label>
					</div>
				)}

				<DropdownDialog.PaginationContainer>
					{groups && <Paginator pagination={groups} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{groups?.result.map(group => (
						<ComboboxOption value={group} key={group.groupId} as={Fragment}>
							{({ focus }) => (
								<button
									type="button"
									onClick={() => onClose(group)}
									data-testid="course-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										focus ? "bg-secondary text-white" : ""
									}`}
								>
									<div className="flex-1 text-left">
										<span className="text-light">{group.name}</span>
									</div>
									<div className="flex-1 text-left">
										<span className="text-light">{group.members.length}</span>
									</div>
								</button>
							)}
						</ComboboxOption>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
	);
}

/**
 * useDefaultGroup - Hook to fetch a single group by ID, typically for pre-selecting a user's default group.
 *
 * Usage: Used in group creation forms to auto-fill the parent group field based on the current user's
 * defaultGroupId setting. Fetches only when enabled and returns null until data loads.
 *
 * @param defaultGroupId - The group ID to fetch (e.g., from session.user.defaultGroupId)
 * @param enabled - If false, the query doesn't run; set true when the form is ready
 * @returns GroupSearchEntry or null if not found or not enabled
 */
export function useDefaultGroup({
	defaultGroupId,
	enabled: shouldFetch = false
}: {
	defaultGroupId?: number;
	enabled?: boolean;
}): GroupSearchEntry | null {
	const enabled = defaultGroupId !== undefined && shouldFetch;
	const query = trpc.permission.getGroup.useQuery({ id: defaultGroupId ?? 0 }, { enabled });

	return enabled && query.data
		? {
				groupId: query.data.id,
				name: query.data.name,
				members: query.data.members.map(m => m.user.displayName),
				slug: query.data.slug
			}
		: null;
}

/**
 * MemberFilter - Chip-based filter component for selecting multiple users to filter groups by members.
 *
 * Usage: Displays selected users as removable chips with an "Add member" button. Opens SearchUserDialog
 * to add users. Used in group search dialogs and filter sections to narrow group results by membership.
 *
 * UI: Chips for selected users + button to open SearchUserDialog
 * Related: SearchUserDialog, SearchGroupDialog
 *
 * @param value - Array of currently selected users
 * @param onChange - Callback with updated user array when adding/removing users
 */
export function MemberFilter({
	value = [],
	onChange
}: {
	value: UserSearchEntry[];
	onChange: (users: UserSearchEntry[]) => void;
}) {
	const [addMemberDialog, setMemberDialog] = useState(false);

	function onRemoveMember(id: string) {
		onChange(value.filter(u => u.id !== id));
	}

	function onAddMember(user?: UserSearchEntry) {
		setMemberDialog(false);
		if (!user) return;

		if (!value.some(u => u.id === user.id)) {
			onChange([...value, user]);
		}
	}

	return (
		<div className="my-4 flex items-center flex-wrap gap-2">
			{value.map(user => (
				<Chip key={user.id} onRemove={() => onRemoveMember(user.id)} displayImage={false}>
					{user.displayName}
					<span className="text-sm text-light">{user.email}</span>
				</Chip>
			))}

			<IconTextButton
				icon={<PlusIcon className="icon h-5" />}
				text="Add member to search"
				className="btn-primary"
				title="Add member to search"
				onClick={() => setMemberDialog(true)}
			/>

			{addMemberDialog && <SearchUserDialog open={addMemberDialog} onClose={onAddMember} />}
		</div>
	);
}
