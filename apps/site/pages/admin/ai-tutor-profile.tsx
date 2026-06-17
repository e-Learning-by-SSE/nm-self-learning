import { useCallback, useState, memo } from "react";
import { useForm, useWatch, UseFormRegister, Control, Controller } from "react-hook-form";
import {
	AITutorProfile,
	defaultAITutorProfile,
	ProfileListItem,
	ProfileFormProps
} from "@self-learning/types";
import { MarkdownField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { ImageOrPlaceholder, showToast } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import { formatDateString } from "@self-learning/util/common";
import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";

/**
 * Sidebar component that lists saved AI tutor profiles and allows selecting one for editing or creating a new profile.
 * @param onSelect Handler to display the selected profile in the form for editing.
 * @param onNew Handler for creating a new profile.
 * @returns Sidebar UI element for managing AI tutor profiles.
 */
function SavedProfilesSidebar({
	onSelect,
	onNew
}: {
	onSelect: (p: AITutorProfile) => void;
	onNew: () => void;
}) {
	const { t } = useTranslation("pages-admin-ai-tutor-profile");
	const profiles = trpc.aiTutorProfile.getAll.useQuery().data ?? [];

	return (
		<div className="w-full bg-white p-6 rounded shadow md:w-1/4 mb-6 md:mb-0">
			<button onClick={onNew} className="btn btn-primary mb-4 w-full">
				{t("Add New Profile")}
			</button>

			<h2 className="text-xl font-bold mb-4">{t("Saved Profiles")}</h2>

			<ul className="space-y-2 max-h-[60vh] overflow-y-auto">
				{profiles.map(profile => (
					<ProfileButton key={profile.id} onSelect={onSelect} profile={profile} />
				))}
			</ul>
		</div>
	);
}

/**
 * Button component for displaying a single AI tutor profile in the sidebar.
 * @param onSelect Handler to display the selected profile in the form for editing.
 * @param profile Profile data passed as props.
 * @returns Button UI element for selecting an AI tutor profile.
 */
const ProfileButton = memo(function ProfileButton({
	onSelect,
	profile
}: {
	onSelect: (p: ProfileListItem) => void;
	profile: ProfileListItem;
}) {
	const { t } = useTranslation("pages-admin-ai-tutor-profile");
	return (
		<button
			className="btn btn-secondary btn-with-icon w-full justify-start"
			onClick={() => onSelect(profile)}
		>
			<ImageOrPlaceholder
				src={profile.avatarUrl ?? undefined}
				alt={t("Profile Picture")}
				className="w-8 h-8 rounded-xl"
			/>
			<span className="flex-grow cursor-default text-left truncate">{profile.name}</span>
		</button>
	);
});

/**
 * Form component for creating or editing an AI tutor profile.
 * @param param0 selected profile data passed as props.
 * @returns Form UI element for managing AI tutor profiles.
 */
function ProfileForm({ selectedProfile }: ProfileFormProps) {
	const session = useSession();
	const userName = session.data?.user?.name;
	const { t } = useTranslation("pages-admin-ai-tutor-profile");
	const { register, handleSubmit, control, reset, setValue } = useForm<AITutorProfile>({
		defaultValues: selectedProfile ?? defaultAITutorProfile
	});

	const profileId = useWatch({ control, name: "id" });
	const isEditing = Boolean(profileId);
	const utils = trpc.useUtils();
	const saveProfile = trpc.aiTutorProfile.save.useMutation({
		onSuccess() {
			// Invalidate the getAll query to refresh the profile list in the sidebar.
			utils.aiTutorProfile.getAll.invalidate();
		}
	});
	const deleteProfile = trpc.aiTutorProfile.delete.useMutation({
		onSuccess() {
			utils.aiTutorProfile.getAll.invalidate();
		}
	});

	const handleUploadCompleted = useCallback(
		(url: string) => {
			setValue("avatarUrl", url);
		},
		[setValue]
	);

	const formSubmit = async (data: AITutorProfile) => {
		try {
			await saveProfile.mutateAsync({
				...data,
				avatarUrl: data.avatarUrl || undefined,
				author: userName ?? data.author
			});
			showToast({
				type: "success",
				title: t("Profile Saved"),
				subtitle: t("profile ok msg")
			});
			reset(defaultAITutorProfile);
		} catch {
			showToast({
				type: "error",
				title: t("Failed to save"),
				subtitle: t("save failed msg")
			});
		}
	};

	const handleDeleteProfile = useCallback(async () => {
		if (!selectedProfile?.id) return;
		try {
			await deleteProfile.mutateAsync({ id: selectedProfile.id });
			reset(defaultAITutorProfile);
			showToast({
				type: "success",
				title: t("Profile Deleted"),
				subtitle: t("delete ok msg")
			});
		} catch {
			showToast({
				type: "error",
				title: t("Delete Profile Failed"),
				subtitle: t("delete failed msg")
			});
		}
	}, [selectedProfile, deleteProfile, reset, t]);

	return (
		<div className="w-full md:w-3/4 bg-white p-6 rounded shadow">
			<h1 className="mb-6 text-3xl font-bold">{t("AI Tutor Profile")}</h1>
			<form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
				<div className="flex space-x-6">
					<div className="flex-grow">
						<LabeledField label={t("Profile Name") + " *"}>
							<input
								{...register("name")}
								type="text"
								className="textfield w-full mb-4"
								placeholder={t("Example-Tutor")}
							/>
						</LabeledField>
						<LabeledField label={t("Author")}>
							<input
								{...register("author")}
								type="text"
								className="textfield w-full"
								placeholder={userName || t("Author")}
								readOnly={Boolean(userName)}
							/>
						</LabeledField>
					</div>
					<div className="flex flex-col items-center space-y-3 p-4 rounded border-2 border-dashed border-gray-300">
						<ImageOrPlaceholder
							src={useWatch({ control, name: "avatarUrl" })}
							alt={t("Profile Picture")}
							className="w-20 h-20 rounded-xl"
						/>
						<Upload
							mediaType="image"
							onUploadCompleted={handleUploadCompleted}
							hideAssetPicker={false}
						/>
					</div>
				</div>

				<ModelSelector register={register} control={control} />

				<LabeledField label={t("System Prompt") + " *"}>
					<Controller
						control={control}
						name="systemPrompt"
						render={({ field }) => (
							<MarkdownField
								content={field.value as string}
								setValue={field.onChange}
								inline={true}
								placeholder={t("System context...")}
							/>
						)}
					></Controller>
				</LabeledField>

				<LabeledField label={t("Description")}>
					<textarea
						{...register("description")}
						className="w-full max-h-60 min-h-36"
						placeholder={t("Description about tutor profile...")}
					/>
				</LabeledField>

				<div className="flex space-x-4">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={saveProfile.isPending}
					>
						{saveProfile.isPending
							? t("Saving...")
							: isEditing
								? t("Update Profile")
								: t("Create Profile")}
					</button>

					{isEditing && (
						<>
							<button
								type="button"
								className="btn btn-danger"
								onClick={handleDeleteProfile}
								disabled={deleteProfile.isPending}
							>
								{deleteProfile.isPending ? t("Deleting...") : t("Delete Profile")}
							</button>
							<div className="flex-grow">
								<div className="text-sm text-gray-500 text-end pt-4 gap-1 flex justify-end items-center">
									<span>{t("Last Updated")}:</span>
									{selectedProfile?.updatedAt
										? formatDateString(selectedProfile.updatedAt, "dd.MM.yyyy")
										: null}
								</div>
							</div>
						</>
					)}
				</div>
			</form>
		</div>
	);
}

const ModelSelector = memo(function ModelSelector({
	register,
	control
}: {
	register: UseFormRegister<AITutorProfile>;
	control: Control<AITutorProfile>;
}) {
	const { t } = useTranslation("pages-admin-ai-tutor-profile");
	const currentModel = useWatch({ control, name: "model" });
	const [availableModels, setAvailableModels] = useState<string[]>([]);
	const getModels = trpc.aiTutorProfile.getModels.useMutation();
	const handleFetchAvailableModels = useCallback(async () => {
		try {
			const result = await getModels.mutateAsync();
			setAvailableModels(result.models);
			showToast({
				type: "success",
				title: t("Models fetched"),
				subtitle: t("Available models have been fetched successfully.")
			});
		} catch (error) {
			showToast({
				type: "error",
				title: t("Fetch Models Failed"),
				subtitle: error instanceof Error ? t(error.message) : t("An unknown error occurred")
			});
		}
	}, [getModels, t]);

	return (
		<div className="flex items-end space-x-4">
			<div className="flex-grow">
				<LabeledField label={t("Model")}>
					<select {...register("model")} className="textfield w-full">
						{currentModel && !availableModels.includes(currentModel) && (
							<option value={currentModel}>{currentModel}</option>
						)}
						{!availableModels.length && !currentModel && (
							<option value="">{t("Select a model")}</option>
						)}
						{availableModels.map(model => (
							<option key={model} value={model}>
								{model}
							</option>
						))}
					</select>
				</LabeledField>
			</div>
			<button
				className="btn btn-secondary p-2"
				type="button"
				onClick={handleFetchAvailableModels}
				disabled={availableModels.length !== 0 || getModels.isPending}
			>
				{getModels.isPending ? t("Fetching...") : t("Fetch Models")}
			</button>
		</div>
	);
});

function FormWithSidebar() {
	const [selectedProfile, setSelectedProfile] = useState<AITutorProfile | null>(null);

	const handleSelect = useCallback((p: AITutorProfile) => {
		setSelectedProfile(p);
	}, []);

	const handleNew = useCallback(() => {
		setSelectedProfile(null);
	}, []);

	return (
		<>
			<SavedProfilesSidebar onSelect={handleSelect} onNew={handleNew} />

			{/* key forces clean lifecycle boundary */}
			<ProfileForm key={selectedProfile?.id ?? "new"} selectedProfile={selectedProfile} />
		</>
	);
}

/**
 * Main page component for managing AI tutor profiles in the admin panel.
 * @returns Page UI element for managing AI tutor profiles.
 */
export default function AITutorProfileAdminPage() {
	return (
		<AdminGuard>
			<CenteredSection className="bg-gray-50">
				<div className="max-w-7xl mx-auto p-4 md:flex md:space-x-6">
					<FormWithSidebar />
				</div>
			</CenteredSection>
		</AdminGuard>
	);
}

export const getServerSideProps = withTranslations([
	"common",
	"pages-admin-llm-config",
	"pages-admin-ai-tutor-profile"
]);
