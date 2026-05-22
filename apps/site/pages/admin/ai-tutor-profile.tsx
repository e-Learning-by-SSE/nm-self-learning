import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
	AITutorProfile,
	defaultAITutorProfile,
	ProfileListItem,
	SavedProfilesProps,
	ProfileFormHandle,
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

// ---------------------------------------------------------------------------
// SavedProfiles
//
// Two layers of protection against unnecessary re-renders:
//   1. Defined at module scope → React always sees the same component type.
//   2. Wrapped in React.memo → skips re-render when props are referentially
//      equal. Because `profiles` comes straight from the query cache reference
//      (not rebuilt on every render) and `onSelect`/`onNew` are stable
//      useCallback refs, this component will only re-render when the server
//      returns new profile data.
// ---------------------------------------------------------------------------
const SavedProfiles = memo(function SavedProfiles({
	profiles,
	onSelect,
	onNew
}: SavedProfilesProps) {
	const { t } = useTranslation("pages-admin-ai-tutor-profile");

	return (
		<div className="w-full bg-white p-6 rounded shadow md:w-1/4 mb-6 md:mb-0">
			<button onClick={onNew} className="btn btn-primary mb-4 w-full">
				{t("New Profile")}
			</button>
			<h2 className="text-xl font-bold mb-4">{t("Saved Profiles")}</h2>
			{profiles.length > 0 ? (
				<ul className="space-y-2 max-h-[60vh] overflow-y-auto">
					{profiles.map(profile => (
						<li
							key={profile.id}
							className="btn btn-secondary btn-with-icon w-full justify-start"
							onClick={() => onSelect(profile)}
						>
							<ImageOrPlaceholder
								src={profile.avatarUrl ?? undefined}
								alt={t("Profile Picture")}
								className="w-8 h-8 rounded-xl"
							/>
							<span className="flex-grow cursor-default">
								{nameTrimmer(profile.name)}
							</span>
						</li>
					))}
				</ul>
			) : (
				<p>{t("No saved profiles found")}</p>
			)}
		</div>
	);
});

function nameTrimmer(name: string): string {
	if (name.length > 15) {
		return name.slice(0, 14) + "...";
	}
	return name;
}

// ---------------------------------------------------------------------------
// ProfileForm
//
// All form state, all mutations, and all per-field subscriptions live here.
//
// Cross-component communication (sidebar driving the form) is handled via
// useImperativeHandle, which exposes a stable `resetForm` handle to the page
// without lifting state up or passing setState callbacks as props.
// ---------------------------------------------------------------------------
const ProfileForm = memo(
	forwardRef<ProfileFormHandle, ProfileFormProps>(function ProfileForm({ userName }, ref) {
		const { t } = useTranslation("pages-admin-ai-tutor-profile");

		const { register, handleSubmit, control, reset, setValue } = useForm<AITutorProfile>({
			defaultValues: defaultAITutorProfile
		});

		const profileId = useWatch({ control, name: "id" });
		const avatarUrl = useWatch({ control, name: "avatarUrl" });
		const selectedModel = useWatch({ control, name: "model" });
		const updatedAt = useWatch({ control, name: "updatedAt" });

		const [fetchingModels, setFetchingModels] = useState(false);
		const [availableModels, setAvailableModels] = useState<string[]>([]);

		const getModels = trpc.aiTutorProfile.getModels.useMutation();
		const saveProfile = trpc.aiTutorProfile.save.useMutation();
		const deleteProfile = trpc.aiTutorProfile.delete.useMutation();

		// Expose reset to the parent page so the sidebar can load a selected
		// profile into the form without prop-drilling controlled state upward.
		useImperativeHandle(
			ref,
			() => ({
				resetForm: (values = defaultAITutorProfile) => reset(values)
			}),
			[reset]
		);

		const handleUploadCompleted = useCallback(
			(url: string) => {
				setValue("avatarUrl", url);
			},
			[setValue]
		);

		const formSubmit = useCallback(
			async (data: AITutorProfile) => {
				try {
					await saveProfile.mutateAsync({
						id: data.id,
						name: data.name,
						description: data.description,
						author: userName ?? data.author,
						model: data.model,
						avatarUrl: data.avatarUrl,
						systemPrompt: data.systemPrompt
					});
					showToast({ type: "success", title: t("Profile Saved"), subtitle: "" });
				} catch (error) {
					showToast({
						type: "error",
						title: t("Error creating profile"),
						subtitle:
							error instanceof Error
								? t(error.message)
								: t("An unknown error occurred")
					});
				} finally {
					reset(defaultAITutorProfile);
				}
			},
			[saveProfile, reset, t, userName]
		);

		const handleFetchAvailableModels = useCallback(async () => {
			setFetchingModels(true);
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
					subtitle:
						error instanceof Error ? t(error.message) : t("An unknown error occurred")
				});
			} finally {
				setFetchingModels(false);
			}
		}, [getModels, t]);

		const handleDeleteProfile = useCallback(async () => {
			if (!profileId) return;
			try {
				await deleteProfile.mutateAsync({ id: profileId });
				showToast({ type: "success", title: t("Profile Deleted"), subtitle: "" });
			} catch (error) {
				showToast({
					type: "error",
					title: t("Delete Profile Failed"),
					subtitle:
						error instanceof Error ? t(error.message) : t("An unknown error occurred")
				});
			} finally {
				reset(defaultAITutorProfile);
			}
		}, [profileId, deleteProfile, reset, t]);

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
							{userName && (
								<LabeledField label={t("Author")}>
									<input
										{...register("author")}
										type="text"
										className="textfield w-full"
										placeholder={userName}
										defaultValue={userName}
										readOnly
									/>
								</LabeledField>
							)}
						</div>
						<div className="flex flex-col items-center space-y-3 p-4 rounded border-2 border-dashed border-gray-300">
							<ImageOrPlaceholder
								src={avatarUrl}
								alt={t("Profile Picture")}
								className="w-20 h-20 rounded-xl"
							/>
							{/* handleUploadCompleted is stable (useCallback) so Upload won't re-render */}
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
									{selectedModel ? (
										<option value={selectedModel}>{selectedModel}</option>
									) : (
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
							disabled={availableModels.length !== 0 || fetchingModels}
						>
							{fetchingModels ? t("Fetching...") : t("Fetch Models")}
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
								: profileId
									? t("Update Profile")
									: t("Create Profile")}
						</button>

						{profileId !== undefined && (
							<>
								{/* handleDeleteProfile is stable — no inline arrow wrapper needed */}
								<button
									type="button"
									className="btn btn-danger"
									onClick={handleDeleteProfile}
									disabled={deleteProfile.isPending}
								>
									{deleteProfile.isPending
										? t("Deleting...")
										: t("Delete Profile")}
								</button>
								<div className="flex-grow">
									<div className="text-sm text-gray-500 text-end pt-4">
										{t("Last updated", {
											date: formatDateString(
												updatedAt ?? new Date(),
												"d. MMM yyyy"
											)
										})}
									</div>
								</div>
							</>
						)}
					</div>
				</form>
			</div>
		);
	})
);

// ---------------------------------------------------------------------------
// Page — AITutorProfileAdminPage
//
// The page shell owns almost no state. It holds the query (so the data
// reference is stable and shared) and a ref to the form's imperative handle.
// ---------------------------------------------------------------------------
export default function AITutorProfileAdminPage() {
	const session = useSession();
	const userName = session.data?.user?.name;
	const profiles = trpc.aiTutorProfile.getAll.useQuery();

	// Ref to the form's imperative API. Calling formRef.current.resetForm()
	// drives the form from the sidebar without lifting form state into the page.
	const formRef = useRef<ProfileFormHandle>(null);

	const handleNew = useCallback(() => {
		formRef.current?.resetForm(defaultAITutorProfile);
	}, []);

	const handleSelectProfile = useCallback((profile: ProfileListItem) => {
		formRef.current?.resetForm({
			id: profile.id,
			name: profile.name,
			author: profile.author,
			model: profile.model ?? "",
			description: profile.description ?? "",
			systemPrompt: profile.systemPrompt,
			avatarUrl: profile.avatarUrl ?? undefined,
			updatedAt: profile.updatedAt
		});
	}, []);

	return (
		<AdminGuard>
			<CenteredSection className="bg-gray-50">
				<div className="max-w-7xl mx-auto p-4 md:flex md:space-x-6">
					{/* memo'd + stable props → only re-renders on new server data */}
					<SavedProfiles
						profiles={profiles.data ?? []}
						onSelect={handleSelectProfile}
						onNew={handleNew}
					/>
					{/* forwardRef + useImperativeHandle → form owns its own state entirely */}
					<ProfileForm ref={formRef} userName={userName} />
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
