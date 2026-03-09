import {
	Chip,
	DetailsDropdown,
	Dialog,
	DialogActions,
	IconTextButton,
	OnDialogCloseFn
} from "@self-learning/ui/common";
import { useState } from "react";
import { GroupSearchEntry, SearchGroupDialog } from "./search-group-dialog";
import { PlusIcon } from "@heroicons/react/24/solid";
import { GenericCombobox } from "../editors/group-members";
import { InputWithButton, LabeledField, useSlugify } from "@self-learning/ui/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MergeGroupsSchema, MergeGroupsType, MergeStrategy } from "@self-learning/types";

export const MergeStrategyLabels: Record<MergeStrategy, string> = {
	[MergeStrategy.First]: "Erste Berechtigung behalten",
	[MergeStrategy.Highest]: "Höchste Berechtigung behalten",
	[MergeStrategy.Lowest]: "Niedrigste Berechtigung behalten"
};

export function MergeGroupsDialog({
	isOpen,
	isGlobal,
	onClose
}: {
	isOpen: boolean;
	isGlobal: boolean;
	onClose: OnDialogCloseFn<MergeGroupsType>;
}) {
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);

	const form = useForm<MergeGroupsType>({
		resolver: zodResolver(MergeGroupsSchema),
		defaultValues: {
			strategy: MergeStrategy.First
		}
	});
	const editor = useFieldArray({
		name: "groups",
		control: form.control
	});

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "name", "slug");

	function onAddGroup(group?: GroupSearchEntry): void {
		setGroupDialogOpen(false);
		if (group && !editor.fields.find(g => g.groupId === group.groupId)) {
			editor.append({
				...group
			});
		}
	}

	const mergeStrategyOptions = Object.values(MergeStrategy).map(s => ({
		value: s,
		label: MergeStrategyLabels[s]
	}));

	return (
		<Dialog open={isOpen} onClose={onClose} className="w-[90vw] flex-col lg:w-[800px]">
			<DetailsDropdown
				header="Gruppen zusammenführen"
				headerStyles="text-2xl"
				className="mb-4"
			>
				<MergeStrategyInfo />
			</DetailsDropdown>
			<form
				onSubmit={form.handleSubmit(onClose, console.log)}
				className="flex flex-col gap-4 overflow-auto"
			>
				<LabeledField label="Name" error={form.formState.errors.name?.message}>
					<input
						{...form.register("name")}
						type="text"
						className="textfield"
						placeholder="Name der neuen Gruppe"
					/>
				</LabeledField>
				<LabeledField label="Slug" error={form.formState.errors.slug?.message}>
					<InputWithButton
						input={
							<input
								{...form.register("slug")}
								onBlur={slugifyIfEmpty}
								type="text"
								className="textfield"
								autoComplete="off"
							/>
						}
						button={
							<button type="button" className="btn-stroked" onClick={slugifyField}>
								Generieren
							</button>
						}
					/>
				</LabeledField>
				<LabeledField
					label="Merge-Strategie"
					error={form.formState.errors.strategy?.message}
				>
					<Controller
						control={form.control}
						name="strategy"
						render={({ field }) => (
							<GenericCombobox
								value={field.value}
								onChange={field.onChange}
								options={mergeStrategyOptions}
								label="Auswählen"
							/>
						)}
					/>
				</LabeledField>
				<LabeledField
					label="Gruppen zum Zusammenführen"
					error={form.formState.errors.groups?.root?.message}
				>
					<div className="flex gap-2 flex-wrap">
						{editor.fields.map((field, index) => (
							<Controller
								key={field.groupId}
								name={`groups.${index}`}
								control={form.control}
								render={({ field }) => (
									<Chip
										onRemove={() => editor.remove(index)}
										displayImage={false}
									>
										<div className="flex gap-1 items-center">
											<span className="text-lg">#{index + 1}</span>
											<div className="flex flex-col">
												{field.value.name}
												<span className="text-sm text-light">
													{field.value.slug || ""}
												</span>
											</div>
										</div>
									</Chip>
								)}
							/>
						))}
						<IconTextButton
							icon={<PlusIcon className="icon h-5" />}
							text={"Add group to merge list"}
							className="btn-primary"
							title="Add group to merge list1"
							onClick={() => setGroupDialogOpen(true)}
						/>
					</div>
					{isGroupDialogOpen && (
						<SearchGroupDialog
							isOpen={isGroupDialogOpen}
							isGlobalSearch={isGlobal}
							onClose={onAddGroup}
							exclude={editor.fields.map(f => f.groupId)}
						/>
					)}
				</LabeledField>
				<DialogActions onClose={onClose}>
					<button className="btn-primary">Zusammenführen</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

function MergeStrategyInfo() {
	return (
		<div className="mt-2 flex items-start gap-2 px-4 text-sm text-gray-700">
			<div className="flex-1 space-y-1">
				<p>
					Ein neuer Gruppen-Eintrag wird erstellt. Die alten Gruppen müssen{" "}
					<strong>manuell</strong> gelöscht werden, falls sie nicht mehr benötigt werden.
					So können Sie die Änderungen vor dem endgültigen Löschen prüfen.
				</p>
				<p>
					Hier können Sie die Merge-Strategie auswählen. Die Optionen haben folgende
					Bedeutung:
				</p>
				<ul className="list-disc list-inside space-y-1">
					<li>
						<strong>Erste Gruppe behalten:</strong> Mitglieder erhalten die
						Berechtigungen, wie sie in der angegebenen Gruppenreihenfolge erscheinen.
					</li>
					<li>
						<strong>Gruppe mit höchstem Level behalten:</strong> Mitglieder erhalten die
						jeweils höchste Berechtigung, die sie in den ausgewählten Gruppen haben.
					</li>
					<li>
						<strong>Gruppe mit niedrigstem Level behalten:</strong> Mitglieder erhalten
						die jeweils niedrigste Berechtigung, die sie in den ausgewählten Gruppen
						haben.
					</li>
				</ul>
				<p className="font-semibold text-red-600">
					Sie müssen in allen ausgewählten Gruppen die Rolle <strong>ADMIN</strong>{" "}
					besitzen, um einen Merge durchführen zu können.
				</p>
			</div>
		</div>
	);
}
