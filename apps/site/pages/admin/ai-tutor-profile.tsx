import { useForm } from "react-hook-form";
import { AITutorProfile, defaultAITutorProfile } from "@self-learning/types";
import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { ImageOrPlaceholder } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { formatDateString } from "@self-learning/util/common";
import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";

export default function AITutorProfileAdminPage() {
	const { register, handleSubmit, watch, reset, setValue } = useForm<AITutorProfile>({
		defaultValues: defaultAITutorProfile
	});
	const formData = watch();
	const [fetchingModels, setFetchingModels] = useState(false);
	const [availableModels, setAvailableModels] = useState<string[]>([]);
	const session = useSession();
	const user = session.data?.user;
	const getModels = trpc.aiTutorProfile.getModels.useMutation();
	const profiles = trpc.aiTutorProfile.getAll.useQuery();
	const saveProfile = trpc.aiTutorProfile.save.useMutation();
	const deleteProfile = trpc.aiTutorProfile.delete.useMutation();
	const { t } = useTranslation("pages-admin-ai-tutor-profile");

	const formSubmit = async (data: typeof formData) => {
		try {
			await saveProfile.mutateAsync({
				id: data.id,
				name: data.name,
				description: data.description,
				author: data.author,
				model: data.model,
				avatarUrl: data.avatarUrl,
				systemPrompt: data.systemPrompt
			});
			showToast({
				type: "success",
				title: t("Profile Saved"),
				subtitle: ""
			});
		} catch (error) {
			showToast({
				type: "error",
				title: t("Error creating profile"),
				subtitle: error instanceof Error ? t(error.message) : t("An unknown error occurred")
			});
		} finally {
			reset(defaultAITutorProfile);
		}
	};

	const handleFetchAvailableModels = async () => {
		setFetchingModels(true);
		try {
			const models = await getModels.mutateAsync();
			setAvailableModels(models.models);
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
		} finally {
			setFetchingModels(false);
		}
	};

	const handleDeleteProfile = async (data: typeof formData) => {
		try {
			await deleteProfile.mutateAsync({
				id: data.id,
				name: data.name,
				description: data.description,
				author: data.author,
				model: data.model,
				avatarUrl: data.avatarUrl,
				systemPrompt: data.systemPrompt
			});
		} catch (error) {
			showToast({
				type: "error",
				title: t("Delete Profile Failed"),
				subtitle: error instanceof Error ? t(error.message) : t("An unknown error occurred")
			});
		} finally {
			reset(defaultAITutorProfile);
		}
	};

	function nameTrimmer(name: string): string {
		if (name.length > 15) {
			return name.slice(0, 14) + "...";
		}
		return name;
	}

	function SavedProfiles() {
		return (
			<div className="w-full bg-white p-6 rounded shadow md:w-1/4 mb-6 md:mb-0">
				<button
					onClick={() => {
						reset(defaultAITutorProfile);
					}}
					className="btn btn-primary mb-4 w-full"
				>
					{t("New Profile")}
				</button>
				<h2 className="text-xl font-bold mb-4">{t("Saved Profiles")}</h2>
				{profiles.data?.length ? (
					<ul className="space-y-2 max-h-[60vh] overflow-y-auto">
						{profiles.data.map(profile => (
							<li
								key={profile.id}
								className="btn btn-secondary btn-with-icon w-full justify-start"
								onClick={() =>
									reset({
										id: profile.id,
										name: profile.name,
										author: profile.author,
										model: profile.model ?? "",
										description: profile.description ?? "",
										systemPrompt: profile.systemPrompt,
										avatarUrl: profile.avatarUrl ?? undefined,
										updatedAt: profile.updatedAt
									})
								}
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
	}

	return (
		<AdminGuard>
			<CenteredSection className="bg-gray-50">
				<div className="max-w-7xl mx-auto p-4 md:flex md:space-x-6">
					<SavedProfiles />
					<div className="w-full md:w-3/4 bg-white p-6 rounded shadow">
						<h1 className="mb-6 text-3xl font-bold">{t("AI Tutor Profile")}</h1>
						<form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
							<div className="flex space-x-6">
								<div className="flex-grow">
									<LabeledField label={t("Profile Name") + " *"}>
										<input
											{...register("name")}
											type={"text"}
											className="textfield w-full mb-4"
											placeholder={t("Psychology-Tutor")}
										/>
									</LabeledField>
									<LabeledField label={t("Author" + " *")}>
										<input
											{...register("author")}
											type={"text"}
											className="textfield w-full"
											placeholder={"Admin"}
											value={user?.name || "Admin"}
											readOnly
										/>
									</LabeledField>
								</div>
								<div className="flex flex-col items-center space-y-3 p-4 rounded border-2 border-dashed border-gray-300">
									<ImageOrPlaceholder
										src={watch("avatarUrl")}
										alt={t("Profile Picture")}
										className="w-20 h-20 rounded-xl"
									/>
									<Upload
										mediaType="image"
										onUploadCompleted={url => {
											setValue("avatarUrl", url);
										}}
										hideAssetPicker={true}
									/>
								</div>
							</div>
							{/* Move this to a shared component */}
							<div className="flex items-end space-x-4">
								<div className="flex-grow">
									<LabeledField label={t("Model")}>
										<select {...register("model")} className="textfield w-full">
											{formData.model ? (
												<option value={formData.model}>
													{formData.model}
												</option>
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
									{getModels.isLoading ? t("Fetching...") : t("Fetch Models")}
								</button>
							</div>
							<LabeledField label={t("System Prompt") + " *"}>
								<textarea
									{...register("systemPrompt")}
									className="w-full max-h-60 min-h-36"
									placeholder={t("System context...")}
								/>
							</LabeledField>
							<LabeledField label="Description">
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
									disabled={saveProfile.isLoading}
								>
									{saveProfile.isLoading
										? t("Saving...")
										: formData.id
											? t("Update Profile")
											: t("Create Profile")}
								</button>
								{/* Move this to a shared component */}
								{formData.id !== undefined && (
									<>
										<button
											type="button"
											className="btn btn-danger"
											onClick={() => {
												handleDeleteProfile(formData);
											}}
											disabled={deleteProfile.isLoading}
										>
											{deleteProfile.isLoading
												? t("Deleting...")
												: t("Delete Profile")}
										</button>
										<div className="flex-grow">
											<div className="text-sm text-gray-500 text-end pt-4">
												{t("Last updated", {
													date: formatDateString(
														formData.updatedAt ?? new Date(),
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
				</div>
			</CenteredSection>
		</AdminGuard>
	);
}
export const getServerSideProps = withTranslations([
	"common",
	"pages-admin-llm-config",
	"pages-admin-ai-tutor-profiles"
]);
