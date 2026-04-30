import { Combobox, ComboboxButton, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { ArrowsUpDownIcon, TrashIcon } from "@heroicons/react/24/solid";
import { GroupRole } from "@prisma/client";
import { SearchUserDialog, UserSearchEntry } from "@self-learning/admin";
import { Member } from "@self-learning/types";
import {
	Chip,
	DialogActions,
	IconTextButton,
	IconOnlyButton,
	OnDialogCloseFn,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useEffect, useMemo, useState } from "react";
import { add } from "date-fns";
import { formatDateDistanceToNow, isInThePast } from "@self-learning/util/common";

type DurationId = "inf" | "1m" | "3m" | "6m" | "1y" | "custom";
export type MemberFormModel = Member & {
	durationId?: DurationId;
};

const membershipOptions: { label: string; value: { id: DurationId; months: number } }[] = [
	{ label: "1 Monat", value: { id: "1m", months: 1 } },
	{ label: "3 Monate", value: { id: "3m", months: 3 } },
	{ label: "6 Monate", value: { id: "6m", months: 6 } },
	{ label: "1 Jahr", value: { id: "1y", months: 12 } },
	{ label: "Unbefristet", value: { id: "inf", months: 0 } },
	{ label: "Datum", value: { id: "custom", months: 0 } }
];

const groupRoleOptions = [
	{ label: "Administrator", value: GroupRole.ADMIN },
	{ label: "Mitglied", value: GroupRole.MEMBER }
];

function formatDate(d: Date) {
	return d.toISOString().slice(0, 10);
}
function getDurationOpt(member: MemberFormModel) {
	const id = member.durationId ?? (member.expiresAt ? "custom" : "inf");
	const dur = membershipOptions.find(o => o.value.id === id);
	if (!dur) throw new Error("Invalid duration option!");
	return dur.value;
}

/**
 * createDefaultMember - Factory function to create a new member form model with default values.
 *
 * Usage: Called when adding a new member to a group form. Creates an empty member object with
 * undefined user and either ADMIN (if onlyAdmin) or MEMBER role, no expiration.
 *
 * @param onlyAdmin - If true, force role to ADMIN; if false, default to MEMBER
 * @returns MemberFormModel with empty user and role selection
 */
export function createDefaultMember(onlyAdmin?: boolean): MemberFormModel {
	return {
		role: onlyAdmin ? GroupRole.ADMIN : GroupRole.MEMBER,
		expiresAt: null,
		durationId: "inf",
		user: {
			id: "",
			displayName: null,
			email: null,
			author: null
		}
	};
}

/**
 * useMemberEditor - Hook handling member form state and role/expiration logic.
 *
 * Usage: Called by member editor components to manage member updates (role changes, date pickers).
 * Auto-enforces rules: ADMIN role = unlimited duration, MEMBER role supports expiration.
 * Provides setter functions and derived values (formatted dates, filtered options).
 *
 * @param member - Current member form data
 * @param onChange - Callback with updated member when any field changes
 * @param onlyAdmin - If true, restrict role options to ADMIN only
 * @returns Object with setters (setRole, setDuration, setUser, setCustomDuration) and derived display values
 */
export function useMemberEditor(
	member: MemberFormModel,
	onChange: OnDialogCloseFn<MemberFormModel>,
	onlyAdmin?: boolean
) {
	const update = (patch: Partial<MemberFormModel>) => onChange({ ...member, ...patch });

	// when onlyAdmin changes - selected option also must change
	useEffect(() => {
		if (onlyAdmin && member.role !== GroupRole.ADMIN) {
			onChange({ ...member, role: GroupRole.ADMIN, expiresAt: null, durationId: "inf" });
		}
	}, [onlyAdmin, onChange, member]);

	// handlers
	const setRole = (role: GroupRole) => {
		// ADMIN is always unlimited
		if (role === GroupRole.ADMIN) {
			update({ role, expiresAt: null, durationId: "inf" });
		} else {
			update({ role });
		}
	};

	const setDuration = (opt: (typeof membershipOptions)[number]["value"]) => {
		if (opt.id === "inf" || opt.id === "custom") {
			update({ expiresAt: null, durationId: opt.id });
			return;
		}
		update({ expiresAt: add(Date.now(), { months: opt.months }), durationId: opt.id });
	};

	// date input change
	const setCustomDuration = (v: string) => {
		update({ expiresAt: v ? new Date(v) : null, durationId: "custom" });
	};

	const setUser = (user: UserSearchEntry) => {
		update({ user: { ...user, author: null } });
	};

	// derived values
	const durationOpt = getDurationOpt(member);
	const customDate = member.expiresAt ? formatDate(member.expiresAt) : "";
	const roleOptions = onlyAdmin
		? groupRoleOptions.filter(o => o.value === GroupRole.ADMIN)
		: groupRoleOptions;
	const durationOptions =
		member.role === GroupRole.ADMIN
			? membershipOptions.filter(o => o.value.id === "inf")
			: membershipOptions;

	return {
		customDate,
		durationOpt,
		roleOptions,
		durationOptions,
		setUser,
		setRole,
		setDuration,
		setCustomDuration
	};
}

/**
 * GenericCombobox - Reusable dropdown combobox for selecting from a list of typed options.
 *
 * Usage: Generic select component displaying options as a combobox with custom comparison logic.
 * Renders button with current selection label and dropdown menu. Used in role, duration, and other
 * form field selections throughout group editors.
 *
 * UI: Button with dropdown icon + options list with focus/selected states
 *
 * @param value - Currently selected value (null if unselected)
 * @param onChange - Callback when option is selected
 * @param options - Array of {value, label} pairs to display
 * @param label - Placeholder label when no value selected
 * @param compare - Optional custom comparison function for value equality (e.g., for objects)
 */
export function GenericCombobox<T>({
	value,
	onChange,
	options,
	label,
	compare
}: {
	value: T | null;
	onChange: (value: T) => void;
	options: { value: T; label: string }[];
	label: string;
	compare?: (a: T | null, b: T | null) => boolean;
}) {
	const found = options.find(item =>
		compare ? compare(item.value, value) : item.value === value
	);
	const currentLabel = found ? found.label : label;
	return (
		<Combobox
			value={value}
			onChange={v => {
				v && onChange(v);
			}}
			as="div"
			className="relative inline-block w-full text-left bg-white textfield"
			by={compare}
		>
			<ComboboxButton className="inline-flex items-center rounded-md px-4">
				<ArrowsUpDownIcon className="icon h-5" />
				<span>{currentLabel}</span>
			</ComboboxButton>

			<ComboboxOptions
				className={`absolute top-full z-10 w-full origin-top-right bg-white shadow-lg max-h-64 overflow-auto text-sm rounded`}
			>
				{options.map((item, i) => (
					<ComboboxOption key={i} value={item.value}>
						{({ focus, selected }) => (
							<div
								className={`w-full text-left px-3 py-1 flex items-center cursor-default
                  ${focus ? "bg-emerald-500 text-white" : ""}
                  ${selected ? "font-medium border border-emerald-500 rounded" : ""}`}
							>
								{item.label}
							</div>
						)}
					</ComboboxOption>
				))}
			</ComboboxOptions>
		</Combobox>
	);
}

/**
 * GroupMemberEditor - Dialog or form section for editing a single group member's details.
 *
 * Usage: Renders editable fields for member: user selection (SearchUserDialog), role dropdown,
 * duration/expiration selector. Calls onChange on any change. Optional onSubmit adds action buttons.
 * Used as a modal dialog to add/edit a single member, or inline in table row editors.
 *
 * UI: User info display/selector, role combobox, duration combobox, optional date picker,
 * optional submit/cancel buttons opens SearchUserDialog internally
 * Related: useMemberEditor, SearchUserDialog, GenericCombobox, GroupMemberTable
 *
 * @param member - Current member form data
 * @param onChange - Callback when any field changes
 * @param onSubmit - Optional callback for submit button; if provided, adds dialog action buttons
 * @param canEditUser - If true, shows user selector; if false, user is read-only
 * @param onlyAdmin - If true, restricts role to ADMIN only
 */
export function GroupMemberEditor({
	member,
	onChange,
	onSubmit,
	canEditUser,
	onlyAdmin
}: {
	member: MemberFormModel;
	onChange: OnDialogCloseFn<MemberFormModel>;
	onSubmit?: OnDialogCloseFn<MemberFormModel>;
	canEditUser?: boolean;
	onlyAdmin?: boolean;
}) {
	const [selectUserActive, setSelectUserActive] = useState(false);
	const {
		durationOpt,
		customDate,
		roleOptions,
		durationOptions,
		setUser,
		setDuration,
		setCustomDuration,
		setRole
	} = useMemberEditor(member, onChange, onlyAdmin);

	const onCancel = () => {
		onSubmit && onSubmit(undefined);
	};

	const onSelectUser = (user?: UserSearchEntry) => {
		setSelectUserActive(false);
		if (user) {
			setUser(user);
		}
	};

	const today = useMemo(() => {
		const now = new Date();
		return formatDate(now);
	}, []); // run once

	return (
		<div className="flex flex-col gap-2">
			{canEditUser && (
				<div className="flex items-center justify-between gap-4">
					<IconTextButton
						text="Mitglieder*in auswählen"
						className="btn-secondary"
						icon={<ArrowsUpDownIcon className="icon h-5" />}
						onClick={() => setSelectUserActive(true)}
					/>
					{selectUserActive && (
						<SearchUserDialog open={selectUserActive} onClose={onSelectUser} />
					)}
				</div>
			)}
			{member.user.displayName && (
				<Chip displayImage={false}>
					<span>{member?.user.displayName ?? "N/A"}</span>
					<span className="text-sm text-light">{member?.user.email}</span>
				</Chip>
			)}
			<LabeledField label="Rolle auswählen">
				<GenericCombobox
					value={member?.role ?? null}
					onChange={setRole}
					options={roleOptions}
					label={"Auswählen"}
				/>
			</LabeledField>
			<LabeledField label="Mitgliedschaftsdauer auswählen">
				<GenericCombobox
					value={durationOpt}
					onChange={setDuration}
					options={durationOptions}
					label={"Auswählen"}
					compare={(a, b) => a?.id === b?.id}
				/>
				{durationOpt.id === "custom" && (
					<input
						type="date"
						className="textfield"
						min={today}
						value={customDate}
						onChange={e => setCustomDuration(e.target.value)}
					/>
				)}
			</LabeledField>

			{onSubmit && (
				<DialogActions onClose={onCancel}>
					<button className="btn-primary" type="submit">
						Speichern
					</button>
				</DialogActions>
			)}
		</div>
	);
}

/**
 * GroupMemberTable - Wrapper table component for displaying group members in rows.
 *
 * Usage: Container table for rendering a list of group members. Provides standard table header
 * with columns (Name, Role, Duration, Actions) and overflow visible for editing controls.
 * Use with GroupMemberRow or GroupMemberRowEditor children.
 *
 * UI: Table with 4 columns (name, role, duration, actions/delete button)
 * Related: GroupMemberRow, GroupMemberRowEditor, Table (UI component)
 *
 * @param children - Array of row elements (GroupMemberRow or GroupMemberRowEditor)
 */
export function GroupMemberTable({ children }: { children: React.ReactNode[] }) {
	return (
		<Table
			head={
				<>
					<TableHeaderColumn>Name</TableHeaderColumn>
					<TableHeaderColumn>Rolle</TableHeaderColumn>
					<TableHeaderColumn>Dauer</TableHeaderColumn>
					<TableHeaderColumn></TableHeaderColumn>
				</>
			}
			overflow="visible"
		>
			{children}
		</Table>
	);
}

/**
 * GroupMemberRowEditor - Editable table row displaying a member's details with inline role/duration controls.
 *
 * Usage: Renders a single member as a keyboard-editable table row within GroupMemberTable. Allows
 * changing role and duration directly in the table cell using dropdowns. Optional delete button
 * calls onDelete callback. Used in member list forms to edit multiple members inline.
 *
 * UI: Table row with name (read-only), role dropdown, duration dropdown with optional date picker,
 * trash icon to delete. Uses GenericCombobox for dropdowns.
 * Related: GroupMemberTable, useMemberEditor, GroupMemberRow (read-only version)
 *
 * @param member - Member form data
 * @param onChange - Callback when role or duration changes
 * @param onDelete - Optional callback when trash icon clicked; receives the member to delete
 */
export function GroupMemberRowEditor({
	member,
	onChange,
	onDelete
}: {
	member: MemberFormModel;
	onChange: OnDialogCloseFn<MemberFormModel>;
	onDelete?: OnDialogCloseFn<MemberFormModel>;
}) {
	const {
		durationOpt,
		customDate,
		roleOptions,
		durationOptions,
		setDuration,
		setCustomDuration,
		setRole
	} = useMemberEditor(member, onChange);

	const today = useMemo(() => {
		const now = new Date();
		return formatDate(now);
	}, []); // run once

	return (
		<tr key={member.user.id}>
			<TableDataColumn>
				<span className="text-light">{member.user.displayName}</span>
			</TableDataColumn>

			<TableDataColumn>
				<GenericCombobox
					value={member?.role ?? null}
					onChange={setRole}
					options={roleOptions}
					label={"Auswählen"}
				/>
			</TableDataColumn>
			<TableDataColumn className="flex py-2 gap-2">
				<GenericCombobox
					value={durationOpt}
					onChange={setDuration}
					options={durationOptions}
					label={"Auswählen"}
					compare={(a, b) => a?.id === b?.id}
				/>
				{durationOpt.id === "custom" && (
					<input
						type="date"
						min={today}
						className="textfield"
						style={{ height: "auto" }}
						value={customDate}
						onChange={e => setCustomDuration(e.target.value)}
					/>
				)}
			</TableDataColumn>
			<TableDataColumn>
				<IconOnlyButton
					icon={<TrashIcon className="h-4 w-4" />}
					className="btn-x-mark"
					onClick={() => onDelete && onDelete(member)}
				/>
			</TableDataColumn>
		</tr>
	);
}

/**
 * GroupMemberRow - Read-only table row displaying a group member's details.
 *
 * Usage: Renders a single member as a read-only table row within GroupMemberTable. Shows member name,
 * role, and expiration status (with color coding for expired). Optional edit/delete buttons call
 * callbacks. Used to display existing members in a group detail view.
 *
 * UI: Table row with name, role (text), duration (formatted as "expires in X days" or "Expired" in red),
 * optional action buttons. Non-interactive, read-only display.
 * Related: GroupMemberTable, GroupMemberRowEditor (editable version)
 *
 * @param member - Member data to display
 * @param onEdit - Optional callback when edit button clicked
 * @param onDelete - Optional callback when delete button clicked
 */
export function GroupMemberRow({
	member,
	onEdit,
	onDelete
}: {
	member: MemberFormModel;
	onEdit?: OnDialogCloseFn<MemberFormModel>;
	onDelete?: OnDialogCloseFn<MemberFormModel>;
}) {
	return (
		<tr>
			<TableDataColumn>
				<span className="text-light">{member.user.displayName}</span>
			</TableDataColumn>

			<TableDataColumn>
				<span className="text-light">{member.role}</span>
			</TableDataColumn>
			<TableDataColumn>
				<span className="text-light">
					{member.expiresAt ? (
						isInThePast(member.expiresAt) ? (
							<span className="text-red-500">Abgelaufen</span>
						) : (
							formatDateDistanceToNow(member.expiresAt)
						)
					) : (
						"Unbefristet"
					)}
				</span>
			</TableDataColumn>
			<TableDataColumn className="p-2 flex">
				{/* <IconOnlyButton TODO not in this PR
					icon={<PencilIcon className="h-4 w-4" />}
					onClick={() => onEdit && onEdit(member)}
				/>
				<IconOnlyButton
					icon={<TrashIcon className="h-4 w-4" />}
					className="btn-x-mark"
					onClick={() => onDelete && onDelete(member)}
				/> */}
			</TableDataColumn>
		</tr>
	);
}
