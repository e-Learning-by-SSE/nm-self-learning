import { useCallback, useState, useEffect, memo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
	AITutorProfile,
	defaultAITutorProfile,
	ProfileListItem,
	SavedProfilesProps,
	ProfileFormProps
} from "@self-learning/types";
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
 * @param param0 Saved profiles, selection handler, and new profile handler passed as props.
 * @returns Sidebar UI element for managing AI tutor profiles.
 */
export function SavedProfilesSidebar({ profiles, onSelect, onNew }: SavedProfilesProps) {
	const { t } = useTranslation("pages-admin-ai-tutor-profile");

	return (
		<div className="w-full bg-white p-6 rounded shadow md:w-1/4 mb-6 md:mb-0">
			<button onClick={onNew} className="btn btn-primary mb-4 w-full">
				{t("Add New Profile")}
			</button>
			<h2 className="text-xl font-bold mb-4">{t("Saved Profiles")}</h2>
			{profiles.length > 0 ? (
				<ul className="space-y-2 max-h-[60vh] overflow-y-auto">
					{profiles.map(profile => (
						<ProfileButton key={profile.id} profile={profile} onSelect={onSelect} />
					))}
				</ul>
			) : (
				<p>{t("No saved profiles found")}</p>
			)}
		</div>
	);
}

/**
 * Button component for displaying a single AI tutor profile in the sidebar.
 * @param param0 Profile data and selection handler passed as props.
 * @returns Button UI element for selecting an AI tutor profile.
 */
const ProfileButton = memo(function ProfileButton({
	profile,
	onSelect
}: {
	profile: ProfileListItem;
	onSelect: (p: ProfileListItem) => void;
}) {
	const { t } = useTranslation("pages-admin-ai-tutor-profile");
	const handleClick = useCallback(() => onSelect(profile), [profile, onSelect]);
	return (
		<button
			className="btn btn-secondary btn-with-icon w-full justify-start"
			onClick={handleClick}
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
 * @param param0 UserName/authorName and selected profile data passed as props.
 * @returns Form UI element for managing AI tutor profiles.
 */
export function ProfileForm({ userName, selectedProfile }: ProfileFormProps) {
	const { t } = useTranslation("pages-admin-ai-tutor-profile");
	const { register, handleSubmit, control, reset, setValue } = useForm<AITutorProfile>({
		defaultValues: defaultAITutorProfile
	});

	const [availableModels, setAvailableModels] = useState<string[]>([]);
	const profileId = useWatch({ control, name: "id" });
	const currentModel = useWatch({ control, name: "model" });
	const isEditing = Boolean(profileId);
	const utils = trpc.useUtils();
	const getModels = trpc.aiTutorProfile.getModels.useMutation();
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

	// Sync external selection → form state
	useEffect(() => {
		const values = selectedProfile ?? defaultAITutorProfile;
		reset(userName ? { ...values, author: userName } : values);
	}, [selectedProfile, reset, userName]);

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
				author: userName ?? data.author
			});
			showToast({
				type: "success",
				title: t("Profile Saved"),
				subtitle: t("profile ok msg")
			});
			reset(defaultAITutorProfile);
		} catch (error) {
			showToast({
				type: "error",
				title: t("Error creating profile"),
				subtitle: t("save failed msg")
			});
		}
	};

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
				subtitle: t("fetch failed msg")
			});
		}
	}, [getModels, t]);

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
		} catch (error) {
			showToast({
				type: "error",
				title: t("Delete Profile Failed"),
				subtitle: t("delete failed msg")
			});
		}
	}, [selectedProfile?.id, deleteProfile, reset, t]);

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
								placeholder={t("Psychology-Tutor")}
							/>
						</LabeledField>
						<LabeledField label={t("Author")}>
							<input
								{...register("author")}
								type="text"
								className="textfield w-full"
								placeholder={userName || t("Author Name")}
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
							hideAssetPicker={true}
						/>
					</div>
				</div>

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

				<LabeledField label={t("System Prompt") + " *"}>
					<textarea
						{...register("systemPrompt")}
						className="w-full max-h-60 min-h-36"
						placeholder={t("System context...")}
					/>
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

/**
 * Form component for creating or editing an AI tutor profile with a sidebar for managing saved profiles.
 * @param param0 Saved profiles and user name passed as props.
 * @returns Form UI element for managing AI tutor profiles.
 */
function ProfileFormWithSidebar({
	profiles,
	userName
}: {
	profiles: ProfileListItem[];
	userName?: string;
}) {
	const [selectedProfile, setSelectedProfile] = useState<AITutorProfile | null>(null);

	const handleNew = useCallback(() => setSelectedProfile(null), []);
	const handleSelectProfile = useCallback((profile: ProfileListItem) => {
		setSelectedProfile({
			id: profile.id,
			name: profile.name,
			author: profile.author,
			model: profile.model ?? "",
			description: profile.description ?? "",
			systemPrompt: profile.systemPrompt,
			avatarUrl: profile.avatarUrl ?? "",
			updatedAt: profile.updatedAt
		});
	}, []);

	return (
		<>
			<SavedProfilesSidebar
				profiles={profiles}
				onSelect={handleSelectProfile}
				onNew={handleNew}
			/>
			<ProfileForm userName={userName} selectedProfile={selectedProfile} />
		</>
	);
}

/**
 * Main page component for managing AI tutor profiles in the admin panel.
 * @returns Page UI element for managing AI tutor profiles.
 */
export default function AITutorProfileAdminPage() {
	const session = useSession();
	const userName = session.data?.user?.name;
	const { data: profiles = [] } = trpc.aiTutorProfile.getAll.useQuery();

	return (
		<AdminGuard>
			<CenteredSection className="bg-gray-50">
				<div className="max-w-7xl mx-auto p-4 md:flex md:space-x-6">
					<ProfileFormWithSidebar profiles={profiles} userName={userName} />
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
