import { useState, useEffect } from "react";
import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { withTranslations } from "@self-learning/api";
import { formatDateString } from "@self-learning/util/common";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const llmConfigSchema = z.object({
	serverUrl: z.string().url(),
	apiKey: z.string().optional(),
	defaultModel: z.string().min(1)
});

export default function LlmConfigPage() {
	const { register, handleSubmit, reset, watch, setValue } = useForm({
		resolver: zodResolver(llmConfigSchema),
		defaultValues: {
			serverUrl: "",
			apiKey: "",
			defaultModel: ""
		}
	});
	const formData = watch();
	const [fetchingModels, setFetchingModels] = useState(false);
	const [availableModels, setAvailableModels] = useState<string[]>([]);
	const [once, setOnce] = useState(false);
	const { data: config, isLoading, refetch } = trpc.llmConfig.get.useQuery();
	const saveConfig = trpc.llmConfig.save.useMutation();
	const getAvailableModels = trpc.llmConfig.getAvailableModels.useMutation();

	useEffect(() => {
		if (config && !once) {
			reset({
				serverUrl: config.serverUrl,
				apiKey: "",
				defaultModel: config.defaultModel
			});
			setOnce(true);
		}
	}, [config, once, reset]);

	const onSubmit = async (data: typeof formData) => {
		try {
			await saveConfig.mutateAsync({
				serverUrl: data.serverUrl,
				apiKey: data.apiKey || undefined,
				defaultModel: data.defaultModel
			});

			showToast({
				type: "success",
				title: "Configuration Saved",
				subtitle: "LLM configuration has been saved successfully!"
			});

			refetch();
		} catch (error) {
			showToast({
				type: "error",
				title: "Save Failed",
				subtitle: error instanceof Error ? error.message : "Failed to save configuration"
			});
		}
	};

	const handleFetchAvailableModels = async () => {
		setFetchingModels(true);
		try {
			const result = await getAvailableModels.mutateAsync({
				serverUrl: formData.serverUrl,
				apiKey: formData.apiKey || undefined
			});

			if (result.valid) {
				setAvailableModels(result.availableModels);
				showToast({
					type: "success",
					title: "Models Fetched",
					subtitle: `Found ${result.availableModels.length} models on the server.`
				});
			}
		} catch (error) {
			showToast({
				type: "error",
				title: "Fetch Models Failed",
				subtitle:
					error instanceof Error ? error.message : "Failed to fetch available models"
			});
		} finally {
			setFetchingModels(false);
		}
	};

	if (isLoading) {
		return (
			<AdminGuard>
				<CenteredSection>
					<div className="text-center">
						<p className="text-gray-500">Loading LLM configuration...</p>
					</div>
				</CenteredSection>
			</AdminGuard>
		);
	}

	return (
		<AdminGuard>
			<CenteredSection className="bg-gray-50">
				<div className="max-w-4xl mx-auto p-6">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h1 className="text-2xl font-bold text-gray-900 mb-6">
							LLM Server Configuration
						</h1>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div>
								<label
									htmlFor="serverUrl"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									LLM Server URL *
								</label>
								<input
									type="url"
									id="serverUrl"
									{...register("serverUrl")}
									required
									className="textfield w-full"
									placeholder="https://your-llm-server.com"
								/>
								<p className="text-sm text-gray-500 mt-1">
									Base URL of your LLM server (e.g.,
									https://example.com/ollama/api)
								</p>
							</div>

							<div>
								<label
									htmlFor="apiKey"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									API Key (Optional)
								</label>
								<input
									type="password"
									id="apiKey"
									{...register("apiKey")}
									className="textfield w-full"
									placeholder={
										config?.hasApiKey
											? "••••••••••••••••"
											: "Enter API key if required"
									}
								/>
								{config?.hasApiKey && (
									<p className="text-sm text-gray-500 mt-1">
										Leave empty to keep existing API key
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="defaultModel"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Default Model *
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										id="defaultModel"
										{...register("defaultModel")}
										required
										className="textfield max-w-4/5 w-4/5"
										placeholder="llama3.1:8b, gpt-4, claude-3-sonnet, etc."
									/>
									<button
										type="button"
										onClick={handleFetchAvailableModels}
										disabled={
											getAvailableModels.isLoading ||
											fetchingModels ||
											!formData.serverUrl
										}
										className="btn bg-gray-600 text-white hover:bg-gray-700"
									>
										{getAvailableModels.isLoading
											? "Loading..."
											: "Fetch Models"}
									</button>
								</div>
								{availableModels.length > 0 && (
									<div className="mt-2">
										<p className="text-sm text-gray-600 mb-1">
											Available models:
										</p>
										<select
											onChange={e => setValue("defaultModel", e.target.value)}
											className="select w-full"
										>
											<option value="">Select a model</option>
											{availableModels.map(model => (
												<option key={model} value={model}>
													{model}
												</option>
											))}
										</select>
									</div>
								)}
							</div>

							<div className="flex justify-between items-center pt-4 border-t">
								<div className="flex gap-2">
									<button
										type="submit"
										disabled={saveConfig.isLoading}
										className="btn btn-primary"
									>
										{saveConfig.isLoading
											? "Saving..."
											: config
												? "Update Configuration"
												: "Save Configuration"}
									</button>
								</div>

								{config && (
									<div className="text-sm text-gray-500">
										Last updated:{" "}
										{formatDateString(config.updatedAt, "MMM dd, yyyy")}
									</div>
								)}
							</div>
						</form>

						{config && (
							<div className="mt-6 p-4 bg-green-50 rounded-md">
								<h3 className="text-sm font-medium text-green-800 mb-2">
									Current Configuration
								</h3>
								<div className="text-sm text-green-700">
									<p>
										<strong>Server:</strong> {config.serverUrl}
									</p>
									<p>
										<strong>Default Model:</strong> {config.defaultModel}
									</p>
									<p>
										<strong>API Key:</strong>{" "}
										{config.hasApiKey ? "Configured" : "Not configured"}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</CenteredSection>
		</AdminGuard>
	);
}
export const getServerSideProps = withTranslations(["common"]);
