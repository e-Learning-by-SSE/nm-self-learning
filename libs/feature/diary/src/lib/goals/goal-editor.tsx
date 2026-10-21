import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import {
	LearningGoalEditInput,
	learningGoalCreateSchema,
	learningGoalEditSchema
} from "@self-learning/types";
import { Dialog, DialogActions, SearchableCombobox } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { IdSet } from "@self-learning/util/common";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GoalFormModel } from "../util/types";
import { useTranslation } from "next-i18next";

export function CreateGoalDialog({
	onClose,
	initialParentGoal,
	validParents
}: {
	onClose: () => void;
	initialParentGoal?: GoalFormModel;
	validParents: IdSet<GoalFormModel>;
}) {
	const { t } = useTranslation("feature-diary");
	const { mutateAsync: createGoal } = trpc.learningGoal.createGoal.useMutation();

	type FormData = z.infer<typeof learningGoalCreateSchema>;
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(learningGoalCreateSchema),
		defaultValues: {
			description: "",
			parentId: initialParentGoal?.id ?? undefined
		}
	});

	const parentId = watch("parentId");

	async function save(data: FormData) {
		await createGoal({
			...data,
			description: data.description.trim(),
			parentId: parentId || undefined // Ensure parentId is undefined if empty
		});
		onClose();
	}

	return (
		<Dialog title={t("Create_Learning_Goal")} onClose={onClose}>
			<form onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
				<LabeledField label={t("common:Description")} optional={false}>
					<textarea
						{...register("description")}
						className="textfield border border-c-border-strong rounded-md p-2"
						rows={5}
					/>
					{errors.description && (
						<span className="text-c-danger text-sm">{errors.description.message}</span>
					)}
				</LabeledField>
				<LabeledField label={t("Parent_Goal_Label")}>
					<span className="text-sm">{t("Parent_Goal_Description")}</span>
					<SearchableCombobox
						items={validParents.entries()}
						initialSelection={initialParentGoal}
						onChange={item => setValue("parentId", item?.id)}
						getLabel={item => item?.description ?? ""}
						placeholder={t("Select_Goal_Placeholder")}
					/>
				</LabeledField>

				<DialogActions onClose={onClose}>
					<button type="submit" className="btn-primary">
						{t("common:save")}
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export function EditGoalDialog({
	goal,
	onClose,
	onSubmit
}: {
	goal?: GoalFormModel;
	onClose: () => void;
	onSubmit?: (goal: GoalFormModel) => void;
}) {
	const { t } = useTranslation("feature-diary");
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<LearningGoalEditInput>({
		resolver: zodResolver(learningGoalEditSchema),
		defaultValues: goal
	});

	function save(data: LearningGoalEditInput) {
		if (goal && onSubmit) {
			onSubmit({ ...goal, description: data.description.trim() });
		}
		onClose();
	}

	return (
		<Dialog title={t("Edit_Learning_Goal")} onClose={onClose}>
			<form onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
				<LabeledField label={t("common:Description")} optional={false}>
					<textarea
						{...register("description")}
						className="textfield border border-c-border-strong rounded-md p-2"
						rows={5}
					/>
					{errors.description && (
						<span className="text-c-danger text-sm">{errors.description.message}</span>
					)}
				</LabeledField>

				<DialogActions onClose={onClose}>
					<button type="submit" className="btn-primary">
						{t("common:save")}
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
