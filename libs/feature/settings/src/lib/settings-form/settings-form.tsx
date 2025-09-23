"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	EditFeatureSettings,
	EditPersonalSettings,
	editPersonalSettingSchema,
	ResolvedValue
} from "@self-learning/types";
import { OnDialogCloseFn, Toggle } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getUserWithSettings } from "../crud-settings";
import { TFunction, Trans, useTranslation } from "next-i18next";

type SettingsProps = NonNullable<ResolvedValue<typeof getUserWithSettings>>;

export function PersonalSettingsForm({
	personalSettings,
	onSubmit
}: {
	personalSettings: SettingsProps;
	onSubmit: OnDialogCloseFn<EditPersonalSettings>;
}) {
	const form = useForm({
		defaultValues: personalSettings,
		resolver: zodResolver(editPersonalSettingSchema)
	});
	const { t: t_common } = useTranslation("common");
	const { t } = useTranslation("feature-settings");

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
			<LabeledField
				label={t_common("Name")}
				error={form.formState.errors.displayName?.message}
			>
				<input {...form.register("displayName")} type="text" className="textfield" />
			</LabeledField>
			<LabeledField label={t_common("Email")}>
				<input
					type="email"
					disabled
					className="textfield "
					value={
						personalSettings.email ??
						"hier kannst du bald deine E-Mail Adresse hinterlegen"
					}
				/>
			</LabeledField>

			<button className="btn-primary" disabled={!form.formState.isValid}>
				{t("Save Profile")}
			</button>
		</form>
	);
}

export function FeatureSettingsForm({
	featureSettings,
	onChange
}: {
	featureSettings: EditFeatureSettings;
	onChange: OnDialogCloseFn<Partial<EditFeatureSettings>>;
}) {
	const { enabledFeatureLearningDiary, enabledLearningStatistics } = featureSettings;

	const onChangeLtb = (value: boolean) => {
		if (value) {
			onChange({ enabledFeatureLearningDiary: true, enabledLearningStatistics: true });
		}
		onChange({ enabledFeatureLearningDiary: value });
	};

	const onChangeStatistics = (value: boolean) => {
		if (!value) {
			onChange({ enabledLearningStatistics: false, enabledFeatureLearningDiary: false });
		}
		onChange({ enabledLearningStatistics: value });
	};

	const { t: t_common } = useTranslation("common");
	const { t: t_tou } = useTranslation("terms-of-use");

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<ToggleSetting
					value={enabledLearningStatistics}
					onChange={onChangeStatistics}
					label={t_common("Learning-Statistics_other")}
					testid="statistics-toggle"
				/>

				<ExpandableSettingsSection
					title_key={"Learning Statistics - Terms of Use - Title"}
					hoover_key={"Learning Statistics - Terms of Use - Hoover Text"}
					i18nKey="Learning Statistics - Terms of Use"
					t={t_tou}
				/>
			</div>
			<div className="space-y-2">
				<ToggleSetting
					value={enabledFeatureLearningDiary}
					onChange={onChangeLtb}
					label={t_common("Learning-Diary")}
					testid="ltb-toggle"
				/>

				<ExpandableSettingsSection
					title_key={"Learning-Diary - Terms of Use - Title"}
					hoover_key={"Learning-Diary - Terms of Use - Hoover Text"}
					i18nKey="Learning-Diary - Terms of Use"
					t={t_tou}
				/>
			</div>
		</div>
	);
}

function ExpandableSettingsSection({
	hoover_key,
	title_key,
	t,
	i18nKey
}: {
	hoover_key: string;
	title_key: string;
	t: TFunction;
	i18nKey: string;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};
	const { t: t_feature } = useTranslation("feature-settings");

	const btnClass = "text-blue-500 hover:underline" + (isExpanded ? "" : " px-2");

	return (
		<section className="mt-5 rounded-lg bg-white p-3.5">
			<span className="h-32 w-full font-medium" title={t(hoover_key)}>
				{t(title_key)}
			</span>

			{isExpanded && <br />}
			{isExpanded && (
				<Trans
					t={t}
					i18nKey={i18nKey}
					components={{
						strong: <strong />,
						ul: <ul className="list-disc list-inside space-y-2 ml-6" />,
						i: <i />,
						li: <li />
					}}
				/>
			)}
			<button className={btnClass} onClick={toggleExpanded}>
				{t_feature(isExpanded ? "Show less" : "Show more")}
			</button>
		</section>
	);
}

function ToggleSetting({
	value,
	onChange,
	label,
	testid
}: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
	testid?: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<Toggle value={value} onChange={onChange} label={label} testid={testid} />
		</div>
	);
}
