<<<<<<< HEAD
import { useState, useEffect } from "react";
import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { withTranslations } from "@self-learning/api";
import { formatDateString } from "@self-learning/util/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { llmConfigSchema } from "@self-learning/types";
import { TRPCClientError } from "@trpc/client";

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
	const [errorMessage, setErrorMessage] = useState<{ code: string; message: string } | null>(
		null
	);
	const [once, setOnce] = useState(false);
	const { data: config, isLoading, refetch } = trpc.llmConfig.get.useQuery();
	const saveConfig = trpc.llmConfig.save.useMutation();
	const getAvailableModels = trpc.llmConfig.getAvailableModels.useMutation();
	const { t } = useTranslation("pages-admin-llm-config");

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
				title: t("Configuration Saved"),
				subtitle: t("LLM configuration has been saved successfully!")
			});
			setErrorMessage(null);

			refetch();
		} catch (error) {
			setErrorMessage(
				error instanceof TRPCClientError
					? { code: error.data?.code, message: error.message }
					: { code: "UNKNOWN", message: "Failed to save configuration" }
			);
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
					title: t("Models Fetched"),
					subtitle: t("Found x models on the server.", {
						count: result.availableModels.length
					})
				});
				setErrorMessage(null);
			}
		} catch (error) {
			setErrorMessage(
				error instanceof TRPCClientError
					? { code: error.data?.code, message: error.message }
					: { code: "UNKNOWN", message: "Failed to fetch available models" }
			);
			setAvailableModels([]);
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
							{t("LLM Server Configuration")}
						</h1>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div>
								<label
									htmlFor="serverUrl"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("LLM Server URL")} *
								</label>
								<input
									type="url"
									id="serverUrl"
									{...register("serverUrl")}
									required
									className="textfield w-full"
									placeholder="https://example.com/ollama/api"
								/>
								<p className="text-sm text-gray-500 mt-1">
									{t("Base URL of your LLM server", {
										url: "https://example.com/ollama/api"
									})}
								</p>
							</div>

							<div>
								<label
									htmlFor="apiKey"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("API Key (Optional)")}
								</label>
								<input
									type="password"
									id="apiKey"
									{...register("apiKey")}
									className="textfield w-full"
									placeholder={
										config?.hasApiKey
											? "••••••••••••••••"
											: t("Enter API key if required")
									}
								/>
								{config?.hasApiKey && (
									<p className="text-sm text-gray-500 mt-1">
										{t("Leave empty if API key is not required")}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="defaultModel"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("Default Model")} *
								</label>
								<div className="flex gap-4">
									<input
										type="text"
										id="defaultModel"
										{...register("defaultModel")}
										required
										className="textfield max-w-3/4 w-3/4"
										placeholder="llama3.1:8b"
									/>
									<button
										type="button"
										onClick={handleFetchAvailableModels}
										disabled={
											getAvailableModels.isLoading ||
											fetchingModels ||
											!formData.serverUrl
										}
										className="btn-secondary flex-1"
									>
										{getAvailableModels.isLoading
											? t("Fetching...")
											: t("Fetch Models")}
									</button>
								</div>
								{availableModels.length > 0 && (
									<div className="mt-2">
										<p className="text-sm text-gray-600 mb-1">
											{t("Available Models")}:
										</p>
										<select
											onChange={e => setValue("defaultModel", e.target.value)}
											className="select w-full"
										>
											<option value="">{t("Select a model")}</option>
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
											? t("Saving...")
											: config
												? t("Update Configuration")
												: t("Save Configuration")}
									</button>
								</div>

								{config && (
									<div className="text-sm text-gray-500">
										{t("Last updated", {
											date: formatDateString(config.updatedAt, "d. MMM yyyy")
										})}
									</div>
								)}
							</div>
						</form>
						{errorMessage && (
							<div className="mt-4 p-4 bg-red-50 rounded-md">
								<p className="text-sm text-red-700">
									<strong>Code: </strong>
									<span className="text-red-600">{errorMessage.code}</span>
								</p>
								<p className="text-sm text-red-700">
									<strong>Message: </strong>
									<span className="text-red-600">{errorMessage.message}</span>
								</p>
							</div>
						)}

						{config && (
							<div className="mt-6 p-4 bg-green-50 rounded-md">
								<h3 className="text-green-800 mb-2">
									{t("Current Configuration")}
								</h3>
								<div className="text-sm text-green-700">
									<p>
										<strong>{t("Server")}:</strong> {config.serverUrl}
									</p>
									<p>
										<strong>{t("Default Model")}:</strong> {config.defaultModel}
									</p>
									<p>
										<strong>{t("API Key")}</strong>
										{": "}
										{config.hasApiKey ? t("Configured") : t("Not configured")}
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
export const getServerSideProps = withTranslations(["common", "pages-admin-llm-config"]);
=======
import { useState, useEffect } from 'react';
import { AdminGuard, CenteredSection } from '@self-learning/ui/layouts';
import { trpc } from '@self-learning/api-client';
import { showToast } from '@self-learning/ui/common';
import { withTranslations } from '@self-learning/api';

interface LlmConfig {
  id: string;
  serverUrl: string;
  defaultModel: string;
  hasApiKey: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
	const [errorMessage, setErrorMessage] = useState<{ code: string; message: string } | null>(
		null
	);
	const [once, setOnce] = useState(false);
	const { data: config, isLoading, refetch } = trpc.llmConfig.get.useQuery();
	const saveConfig = trpc.llmConfig.save.useMutation();
	const getAvailableModels = trpc.llmConfig.getAvailableModels.useMutation();
	const { t } = useTranslation("pages-admin-llm-config");

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

	// const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
	// 	const { name, value } = e.target;
	// 	setFormData(prev => ({
	// 		...prev,
	// 		[name]: value
	// 	}));
	// };

	const handleValidateConfig = async () => {
		if (!formData.serverUrl || !formData.defaultModel) {
			showToast({
				type: "error",
				title: "Validation Error",
				subtitle: "Please fill in all required fields"
			});
			return;
		}

		setValidating(true);
		try {
			const result = await validateConfig.mutateAsync({
				serverUrl: formData.serverUrl,
				apiKey: formData.apiKey || undefined,
				defaultModel: formData.defaultModel
			});

			if (result.valid) {
				setAvailableModels(result.availableModels);
				showToast({
					type: "success",
					title: "Configuration Valid",
					subtitle: `Successfully connected to LLM server. Found ${result.availableModels.length} models.`
				});

				try {
					const response = await fetch(formData.serverUrl + "api/generate", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: formData.apiKey ? `Bearer ${formData.apiKey}` : ""
						},
						body: JSON.stringify({
							prompt: "hello world",
							model: formData.defaultModel,
							stream: false
						})
					});
					if (!response.ok) {
						throw new Error("Failed to generate response from LLM server");
					}
					const data = await response.json();
					setResponse(data.response);
					showToast({
						type: "success",
						title: "Test Successful",
						subtitle: `LLM server responded with: ${data.response}`
					});
				} catch (err) {
					console.error("Error occurred while testing LLM server:", err);
				}
			}
		} catch (error) {
			showToast({
				type: "error",
				title: "Validation Failed",
				subtitle: error instanceof Error ? error.message : "Unknown error occurred"
			});
		} finally {
			setValidating(false);
		}
	};

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
			setErrorMessage(
				error instanceof TRPCClientError
					? { code: error.data?.code, message: error.message }
					: { code: "UNKNOWN", message: "Failed to save configuration" }
			);
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
					title: t("Models Fetched"),
					subtitle: t("Found x models on the server.", {
						count: result.availableModels.length
					})
				});
				setErrorMessage(null);
			}
		} catch (error) {
			setErrorMessage(
				error instanceof TRPCClientError
					? { code: error.data?.code, message: error.message }
					: { code: "UNKNOWN", message: "Failed to fetch available models" }
			);
			setAvailableModels([]);
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
							{t("LLM Server Configuration")}
						</h1>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div>
								<label
									htmlFor="serverUrl"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("LLM Server URL")} *
								</label>
								<input
									type="url"
									id="serverUrl"
									{...register("serverUrl")}
									required
									className="textfield w-full"
									placeholder="https://example.com/ollama/api"
								/>
								<p className="text-sm text-gray-500 mt-1">
									{t("Base URL of your LLM server", {
										url: "https://example.com/ollama/api"
									})}
								</p>
							</div>

							<div>
								<label
									htmlFor="apiKey"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("API Key (Optional)")}
								</label>
								<input
									type="password"
									id="apiKey"
									{...register("apiKey")}
									className="textfield w-full"
									placeholder={
										config?.hasApiKey
											? "••••••••••••••••"
											: t("Enter API key if required")
									}
								/>
								{config?.hasApiKey && (
									<p className="text-sm text-gray-500 mt-1">
										{t("Leave empty if API key is not required")}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="defaultModel"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("Default Model")} *
								</label>
								<div className="flex gap-4">
									<input
										type="text"
										id="defaultModel"
										{...register("defaultModel")}
										required
										className="textfield max-w-3/4 w-3/4"
										placeholder="llama3.1:8b"
									/>
									<button
										type="button"
										onClick={handleFetchAvailableModels}
										disabled={
											getAvailableModels.isLoading ||
											fetchingModels ||
											!formData.serverUrl
										}
										className="btn-secondary flex-1"
									>
										{getAvailableModels.isLoading
											? t("Fetching...")
											: t("Fetch Models")}
									</button>
								</div>
								{availableModels.length > 0 && (
									<div className="mt-2">
										<p className="text-sm text-gray-600 mb-1">
											{t("Available Models")}:
										</p>
										<select
											onChange={e => setValue("defaultModel", e.target.value)}
											className="select w-full"
										>
											<option value="">{t("Select a model")}</option>
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
											? t("Saving...")
											: config
												? t("Update Configuration")
												: t("Save Configuration")}
									</button>
								</div>

								{config && (
									<div className="text-sm text-gray-500">
										{t("Last updated", {
											date: formatDateString(config.updatedAt, "d. MMM yyyy")
										})}
									</div>
								)}
							</div>
						</form>
						{errorMessage && (
							<div className="mt-4 p-4 bg-red-50 rounded-md">
								<p className="text-sm text-red-700">
									<strong>Code: </strong>
									<span className="text-red-600">{errorMessage.code}</span>
								</p>
								<p className="text-sm text-red-700">
									<strong>Message: </strong>
									<span className="text-red-600">{errorMessage.message}</span>
								</p>
							</div>
						)}

						{config && (
							<div className="mt-6 p-4 bg-green-50 rounded-md">
								<h3 className="text-green-800 mb-2">
									{t("Current Configuration")}
								</h3>
								<div className="text-sm text-green-700">
									<p>
										<strong>{t("Server")}:</strong> {config.serverUrl}
									</p>
									<p>
										<strong>{t("Default Model")}:</strong> {config.defaultModel}
									</p>
									<p>
										<strong>{t("API Key")}</strong>
										{": "}
										{config.hasApiKey ? t("Configured") : t("Not configured")}
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
export const getServerSideProps = withTranslations(["common", "pages-admin-llm-config"]);
=======
import { useState, useEffect } from 'react';
import { AdminGuard, CenteredSection } from '@self-learning/ui/layouts';
import { trpc } from '@self-learning/api-client';
import { showToast } from '@self-learning/ui/common';
import { withTranslations } from '@self-learning/api';

interface LlmConfig {
  id: string;
  serverUrl: string;
  defaultModel: string;
  hasApiKey: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
	const [errorMessage, setErrorMessage] = useState<{ code: string; message: string } | null>(
		null
	);
	const [once, setOnce] = useState(false);
	const { data: config, isLoading, refetch } = trpc.llmConfig.get.useQuery();
	const saveConfig = trpc.llmConfig.save.useMutation();
	const getAvailableModels = trpc.llmConfig.getAvailableModels.useMutation();
	const { t } = useTranslation("pages-admin-llm-config");

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

	// const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
	// 	const { name, value } = e.target;
	// 	setFormData(prev => ({
	// 		...prev,
	// 		[name]: value
	// 	}));
	// };

	const handleValidateConfig = async () => {
		if (!formData.serverUrl || !formData.defaultModel) {
			showToast({
				type: "error",
				title: "Validation Error",
				subtitle: "Please fill in all required fields"
			});
			return;
		}

		setValidating(true);
		try {
			const result = await validateConfig.mutateAsync({
				serverUrl: formData.serverUrl,
				apiKey: formData.apiKey || undefined,
				defaultModel: formData.defaultModel
			});

			if (result.valid) {
				setAvailableModels(result.availableModels);
				showToast({
					type: "success",
					title: "Configuration Valid",
					subtitle: `Successfully connected to LLM server. Found ${result.availableModels.length} models.`
				});

				try {
					const response = await fetch(formData.serverUrl + "api/generate", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: formData.apiKey ? `Bearer ${formData.apiKey}` : ""
						},
						body: JSON.stringify({
							prompt: "hello world",
							model: formData.defaultModel,
							stream: false
						})
					});
					if (!response.ok) {
						throw new Error("Failed to generate response from LLM server");
					}
					const data = await response.json();
					setResponse(data.response);
					showToast({
						type: "success",
						title: "Test Successful",
						subtitle: `LLM server responded with: ${data.response}`
					});
				} catch (err) {
					console.error("Error occurred while testing LLM server:", err);
				}
			}
		} catch (error) {
			showToast({
				type: "error",
				title: t("Save Failed"),
				subtitle: error instanceof Error ? error.message : t("Failed to save configuration")
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
					title: t("Models Fetched"),
					subtitle: t("Found x models on the server.", {
						count: result.availableModels.length
					})
				});
			}
		} catch (error) {
			if (error instanceof TRPCError) {
				showToast({
					type: "error",
					title: t(error.code),
					subtitle: t(error.message)
				});
			} else {
				showToast({
					type: "error",
					title: t("Fetch Models Failed"),
					subtitle:
						error instanceof Error
							? error.message
							: t("Failed to fetch available models")
				});
			}
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
							{t("LLM Server Configuration")}
						</h1>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div>
								<label
									htmlFor="serverUrl"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("LLM Server URL *")}
								</label>
								<input
									type="url"
									id="serverUrl"
									{...register("serverUrl")}
									required
									className="textfield w-full"
									placeholder="https://example.com/ollama/api"
								/>
								<p className="text-sm text-gray-500 mt-1">
									{t("Base URL of your LLM server")} (e.g.,
									https://example.com/ollama/api)
								</p>
							</div>

							<div>
								<label
									htmlFor="apiKey"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("API Key (Optional)")}
								</label>
								<input
									type="password"
									id="apiKey"
									{...register("apiKey")}
									className="textfield w-full"
									placeholder={
										config?.hasApiKey
											? "••••••••••••••••"
											: t("Enter API key if required")
									}
								/>
								{config?.hasApiKey && (
									<p className="text-sm text-gray-500 mt-1">
										{t("Leave empty if API key is not required")}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="defaultModel"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{t("Default Model *")}
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										id="defaultModel"
										{...register("defaultModel")}
										required
										className="textfield max-w-4/5 w-4/5"
										placeholder="llama3.1:8b"
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
											? t("Fetching...")
											: t("Fetch Models")}
									</button>
								</div>
								{availableModels.length > 0 && (
									<div className="mt-2">
										<p className="text-sm text-gray-600 mb-1">
											{t("Available Models:")}
										</p>
										<select
											onChange={e => setValue("defaultModel", e.target.value)}
											className="select w-full"
										>
											<option value="">{t("Select a model")}</option>
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
											? t("Saving...")
											: config
												? t("Update Configuration")
												: t("Save Configuration")}
									</button>
								</div>

								{config && (
									<div className="text-sm text-gray-500">
										{t("Last updated:")}{" "}
										{formatDateString(config.updatedAt, "MMM dd, yyyy")}
									</div>
								)}
							</div>
						</form>

            {/* Configuration Status */}
            {config && (
              <div className="mt-6 p-4 bg-green-50 rounded-md">
                <h3 className="text-sm font-medium text-green-800 mb-2">Current Configuration</h3>
                <div className="text-sm text-green-700">
                  <p><strong>Server:</strong> {config.serverUrl}</p>
                  <p><strong>Default Model:</strong> {config.defaultModel}</p>
                  <p><strong>API Key:</strong> {config.hasApiKey ? 'Configured' : 'Not configured'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CenteredSection>
    </AdminGuard>
  );
} export const getServerSideProps = withTranslations(["common"]);
>>>>>>> 65fb8528 (feature: use tRPC for database and  validate llm servers.)
