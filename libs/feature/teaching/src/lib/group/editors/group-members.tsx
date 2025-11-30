import { Combobox, ComboboxButton, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { GroupRole } from "@prisma/client";
import { SearchUserDialog, UserSearchEntry } from "@self-learning/admin";
import { Member } from "@self-learning/types";
import { Chip, DialogActions, IconButton, OnDialogCloseFn } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useMemo, useState } from "react";
import { add } from "date-fns";

export type MemberFormModel = Member;

// export function GroupMemberDialog({
//     onClose,
//     repositoryId
// }: {
//     onClose: OnDialogCloseFn<MemberFormModel>;
//     repositoryId: string;
// }) {
//     const { data: skills, isLoading } = trpc.skill.getUnresolvedSkillsFromRepo.useQuery({
//         repoId: repositoryId
//     });

//     return (
//         <Dialog onClose={() => onClose(undefined)} title={"Add member"}>
//             {isLoading ? (
//                 <LoadingBox />
//             ) : (
//                 <>
//                     {skills && (
//                         <AddMemberForm
//                             onClose={onClose}
//                             //skills is missing some properties here
//                             skills={skills as SkillFormModel[]}
//                         />
//                     )}
//                 </>
//             )}
//         </Dialog>
//     );
// }

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
	const currentLabel = useMemo(() => {
		const found = options.find(item =>
			compare ? compare(item.value, value) : item.value === value
		);
		return found ? found.label : label;
	}, [value, options, compare, label]);
	return (
		<Combobox
			value={value}
			onChange={onChange}
			as="div"
			className="relative inline-block w-full text-left bg-white textfield"
			by={compare}
		>
			<ComboboxButton className="inline-flex items-center rounded-md px-4">
				<ArrowsUpDownIcon className="icon h-5" />
				<span>{currentLabel}</span>
			</ComboboxButton>

			<ComboboxOptions
				className={`absolute mt-2 z-10 w-full origin-top-right bg-white shadow-lg max-h-64 overflow-auto text-sm rounded`}
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

export function GroupMemberAdd({
	member,
	onChange,
	onSubmit,
	canEditUser
}: {
	member?: MemberFormModel;
	onChange: OnDialogCloseFn<MemberFormModel>;
	onSubmit?: OnDialogCloseFn<MemberFormModel>;
	canEditUser?: boolean;
}) {
	const membershipOptions = [
		{ label: "1 month", value: { id: "1m", months: 1 } },
		{ label: "3 months", value: { id: "3m", months: 3 } },
		{ label: "6 months", value: { id: "6m", months: 6 } },
		{ label: "1 year", value: { id: "1y", months: 12 } },
		{ label: "No limit", value: { id: "inf", months: 0 } },
		{ label: "Custom", value: { id: "custom", months: 0 } }
	];

	const groupRoleOptions = [
		{ label: "Administrator", value: GroupRole.ADMIN },
		{ label: "Member", value: GroupRole.MEMBER },
		{ label: "Owner", value: GroupRole.OWNER }
	];

	const [selectUserActive, setSelectUserActive] = useState(false);

	const updateMember = (patch: Partial<MemberFormModel>) =>
		onChange({ ...(member ?? ({} as MemberFormModel)), ...patch });

	const formatDate = (d: Date) => d.toISOString().slice(0, 10);

	// init duration option and custom date based on initialMember.expiresAt
	const initialDuration = member?.expiresAt
		? membershipOptions.find(o => o.value.id === "custom")?.value
		: membershipOptions.find(o => o.value.id === "inf")?.value;
	const [durationOpt, setDurationOpt] = useState(initialDuration);
	const [customDate, setCustomDate] = useState<string>(() =>
		member?.expiresAt ? formatDate(member.expiresAt) : ""
	);

	const onCancel = () => {
		onSubmit && onSubmit(undefined);
	};

	const onSelectUser = (user?: UserSearchEntry) => {
		setSelectUserActive(false);
		if (user) {
			updateMember({ user: { ...user, author: null } });
		}
	};

	const onSelectRole = (role: GroupRole) => {
		updateMember({ role });
	};

	const handleDurationSelect = (opt: (typeof membershipOptions)[number]["value"]) => {
		setDurationOpt(opt);
		if (opt.id === "inf") {
			updateMember({ expiresAt: undefined });
			setCustomDate("");
			return;
		}
		if (opt.id === "custom") return;

		// compute preset
		const expiry = add(Date.now(), { months: opt.months });
		updateMember({ expiresAt: expiry });
		setCustomDate(formatDate(expiry));
	};

	// date input change
	const onCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value;
		setCustomDate(v);
		updateMember({ expiresAt: v ? new Date(v) : undefined });
	};

	return (
		<div className="flex flex-col gap-2">
			{canEditUser && (
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">Mitglieder*in</h1>
					<IconButton
						text="Mitglieder*in auswählen"
						icon={<ArrowsUpDownIcon className="icon h-5" />}
						onClick={() => setSelectUserActive(true)}
					/>
					{selectUserActive && (
						<SearchUserDialog open={selectUserActive} onClose={onSelectUser} />
					)}
				</div>
			)}
			{!canEditUser && <h1 className="text-xl">{member?.user.displayName}</h1>}
			<Chip displayImage={false}>
				<span>{member?.user.displayName ?? "N/A"}</span>
				<span className="text-sm text-light">{member?.user.email}</span>
			</Chip>
			<LabeledField label="Rolle auswählen">
				<GenericCombobox
					value={member?.role ?? null}
					onChange={onSelectRole}
					options={groupRoleOptions}
					label={"Auswählen"}
				/>
			</LabeledField>
			<LabeledField label="Mitgliedschaftsdauer auswählen">
				<GenericCombobox
					value={durationOpt ?? null}
					onChange={handleDurationSelect}
					options={membershipOptions}
					label={"Auswählen"}
					compare={(a, b) => a?.id === b?.id}
				/>
				{durationOpt?.id === "custom" && (
					<input
						type="date"
						className="textfield"
						value={customDate}
						onChange={onCustomDateChange}
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
