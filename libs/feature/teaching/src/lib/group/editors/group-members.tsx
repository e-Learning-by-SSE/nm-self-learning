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
import { useEffect, useState } from "react";
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
	return d.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	});
}
function getDurationOpt(member: MemberFormModel) {
	const id = member.durationId ?? (member.expiresAt ? "custom" : "inf");
	const dur = membershipOptions.find(o => o.value.id === id);
	if (!dur) throw new Error("Invalid duration option!");
	return dur.value;
}

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
