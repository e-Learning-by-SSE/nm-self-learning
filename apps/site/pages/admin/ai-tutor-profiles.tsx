import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { aiTutorProfileSchema } from "@self-learning/types";
import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { ImageOrPlaceholder } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { z } from "zod";
import { formatDateString } from "@self-learning/util/common";
import { withTranslations } from "@self-learning/api";

export default function AITutorProfilesAdminPage() {
	type FormValues = z.infer<typeof aiTutorProfileSchema>;

	const { register, handleSubmit, reset, watch } = useForm<FormValues>({
		resolver: zodResolver(aiTutorProfileSchema),
		defaultValues: {
			id: undefined,
			name: "",
			description: undefined,
			author: "",
			model: undefined,
			profile_pictureUrl: undefined,
			system_context: "",
			updatedAt: undefined
		}
	});
	const formData = watch();
	const [fetchingModels, setFetchingModels] = useState(false);
	const [availableModels, setAvailableModels] = useState<string[]>([]);
	const session = useSession();
	const user = session.data?.user;
	const getModels = trpc.aiTutorProfileRouter.getModels.useMutation();
	const profiles = trpc.aiTutorProfileRouter.getAll.useQuery();
	const saveProfile = trpc.aiTutorProfileRouter.save.useMutation();
	const deleteProfile = trpc.aiTutorProfileRouter.delete.useMutation();

	const formSubmit = async (data: typeof formData) => {
		try {
			await saveProfile.mutateAsync({
				id: data.id,
				name: data.name,
				description: data.description,
				author: data.author,
				model: data.model,
				profile_pictureUrl: data.profile_pictureUrl,
				system_context: data.system_context
			});
			showToast({
				type: "success",
				title: "Profile Saved",
				subtitle: ""
			});
		} catch (error) {
			showToast({
				type: "error",
				title: "Error creating profile",
				subtitle: error instanceof Error ? error.message : "An unknown error occurred."
			});
		}
	};

	const handleFetchAvailableModels = async () => {
		setFetchingModels(true);
		try {
			const models = await getModels.mutateAsync();
			setAvailableModels(models.models);
			showToast({
				type: "success",
				title: "Models fetched",
				subtitle: "Available models have been fetched successfully."
			});
		} catch (error) {
			showToast({
				type: "error",
				title: "Error fetching models",
				subtitle: error instanceof Error ? error.message : "An unknown error occurred."
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
				profile_pictureUrl: data.profile_pictureUrl,
				system_context: data.system_context
			});
		} catch (error) {
			showToast({
				type: "error",
				title: "Delete Profile Failed",
				subtitle: ""
			});
		} finally {
			reset({
				id: undefined,
				name: "",
				description: "",
				author: "",
				model: undefined,
				system_context: "",
				updatedAt: undefined
			});
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
						reset({
							id: undefined,
							name: "",
							description: "",
							author: "",
							model: undefined,
							system_context: "",
							updatedAt: undefined
						});
					}}
					className="btn btn-primary mb-4 w-full"
				>
					New Profile
				</button>
				<h2 className="text-xl font-bold mb-4">Saved Profiles</h2>
				{profiles.data?.length ? (
					<ul className="space-y-2 max-h-[60vh] overflow-y-auto">
						{profiles.data.map(profile => (
							<li
								key={profile.id}
								className="flex space-x-2 border border-emerald-500 bg-transparent text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg gap-2"
								onClick={() =>
									reset({
										id: profile.id,
										name: profile.name,
										author: profile.author,
										model: profile.model ?? "",
										description: profile.description ?? "",
										system_context: profile.systemPrompt,
										profile_pictureUrl: profile.avatarUrl ?? undefined,
										updatedAt: profile.updatedAt
									})
								}
							>
								<ImageOrPlaceholder
									src={watch("profile_pictureUrl") ?? undefined}
									alt="Profile Picture"
									className="w-8 h-8 rounded-xl"
								/>
								<span>{nameTrimmer(profile.name)}</span>
							</li>
						))}
					</ul>
				) : (
					<p>No saved profiles found.</p>
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
						<h1 className="mb-6 text-3xl font-bold">AI Tutor Profiles</h1>
						<form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
							<div className="flex space-x-6">
								<div className="flex-grow">
									<LabeledField label="Profile Name *">
										<input
											{...register("name")}
											type={"text"}
											className="textfield w-full mb-4"
											placeholder={"Psychologist-Tutor"}
										/>
									</LabeledField>
									<LabeledField label="Author *">
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
										src={watch("profile_pictureUrl") ?? undefined}
										alt="Profile Picture"
										className="w-20 h-20 rounded-xl"
									/>
									<Upload
										mediaType="image"
										onUploadCompleted={url => {
											console.log("img-url: ", url);
										}}
										hideAssetPicker
									/>
								</div>
							</div>
							<div className="flex items-end space-x-4">
								<div className="flex-grow">
									<LabeledField label="Model">
										<select {...register("model")} className="textfield w-full">
											{formData.model ? (
												<option value={formData.model}>
													{formData.model}
												</option>
											) : (
												<option value="">Select a model</option>
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
									{getModels.isLoading ? "Fetching" : "Fetch Models"}
								</button>
							</div>
							<LabeledField label="System Prompt *">
								<textarea
									{...register("system_context")}
									className="w-full max-h-60 min-h-36"
									placeholder={"System context..."}
								/>
							</LabeledField>
							<LabeledField label="Description">
								<textarea
									{...register("description")}
									className="w-full max-h-60 min-h-36"
									placeholder={"Description about tutor profile..."}
								/>
							</LabeledField>

							<div className="flex space-x-4">
								<button
									type="submit"
									className="btn btn-primary"
									disabled={saveProfile.isLoading}
								>
									{saveProfile.isLoading
										? "Saving..."
										: formData.id
											? "Update Profile"
											: "Create Profile"}
								</button>
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
												? "Deleting..."
												: "Delete Profile"}
										</button>
										<div className="flex-grow">
											<div className="text-sm text-gray-500 text-end pt-4">
												Last updated:{" "}
												{formatDateString(
													formData.updatedAt ?? new Date(),
													"d. MMM yyyy"
												)}
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
	"ai-tutor"
]);
