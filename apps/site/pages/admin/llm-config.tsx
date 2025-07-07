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
  const [formData, setFormData] = useState({
    serverUrl: '',
    apiKey: '',
    defaultModel: ''
  });
  const [validating, setValidating] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // tRPC queries and mutations
  const { data: config, isLoading, refetch } = trpc.admin.llmConfig.get.useQuery();
  const validateConfig = trpc.admin.llmConfig.validate.useMutation();
  const saveConfig = trpc.admin.llmConfig.save.useMutation();
  const getAvailableModels = trpc.admin.llmConfig.getAvailableModels.useQuery(
    undefined,
    { enabled: !!config }
  );

  // Initialize form data when config is loaded
  useEffect(() => {
    if (config) {
      setFormData({
        serverUrl: config.serverUrl,
        apiKey: '', // Don't populate API key for security
        defaultModel: config.defaultModel
      });
    }
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleValidateConfig = async () => {
    if (!formData.serverUrl || !formData.defaultModel) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        subtitle: 'Please fill in all required fields'
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
          type: 'success',
          title: 'Configuration Valid',
          subtitle: `Successfully connected to LLM server. Found ${result.availableModels.length} models.`
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Validation Failed',
        subtitle: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveConfig.mutateAsync({
        serverUrl: formData.serverUrl,
        apiKey: formData.apiKey || undefined,
        defaultModel: formData.defaultModel
      });

      showToast({
        type: 'success',
        title: 'Configuration Saved',
        subtitle: 'LLM configuration has been saved successfully!'
      });

      // Refetch the config to update the UI
      refetch();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        subtitle: error instanceof Error ? error.message : 'Failed to save configuration'
      });
    }
  };

  const handleFetchAvailableModels = async () => {
    try {
      const models = await getAvailableModels.refetch();
      if (models.data) {
        setAvailableModels(models.data.map((model: any) => model.name));
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to Fetch Models',
        subtitle: 'Could not retrieve available models from the server'
      });
    }
  };

  if (isLoading) {
    return (
      <CenteredSection>
        <div className="text-center">
          <p className="text-gray-500">Loading LLM configuration...</p>
        </div>
      </CenteredSection>
    );
  }

  return (
    <AdminGuard>
      <CenteredSection className="bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">LLM Server Configuration</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  LLM Server URL *
                </label>
                <input
                  type="url"
                  id="serverUrl"
                  name="serverUrl"
                  value={formData.serverUrl}
                  onChange={handleInputChange}
                  required
                  className="textfield w-full"
                  placeholder="https://your-llm-server.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Base URL of your LLM server (e.g., Ollama server)
                </p>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (Optional)
                </label>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  className="textfield w-full"
                  placeholder={config?.hasApiKey ? "••••••••••••••••" : "Enter API key if required"}
                />
                {config?.hasApiKey && (
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to keep existing API key
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="defaultModel" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Model *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="defaultModel"
                    name="defaultModel"
                    value={formData.defaultModel}
                    onChange={handleInputChange}
                    required
                    className="textfield max-w-4/5 w-4/5"
                    placeholder="llama3.1:8b, gpt-4, claude-3-sonnet, etc."
                  />
                  {config && (
                    <button
                      type="button"
                      onClick={handleFetchAvailableModels}
                      disabled={getAvailableModels.isLoading}
                      className="btn bg-gray-600 text-white hover:bg-gray-700"
                    >
                      {getAvailableModels.isLoading ? 'Loading...' : 'Fetch Models'}
                    </button>
                  )}
                </div>
                {availableModels.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Available models:</p>
                    <select
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultModel: e.target.value }))}
                      className="select w-full"
                    >
                      <option  value="">Select a model</option>
                      {availableModels.map(model => (
                        <option  key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleValidateConfig}
                    disabled={validating || !formData.serverUrl || !formData.defaultModel}
                    className="btn bg-gray-600 text-white hover:bg-gray-700"
                  >
                    {validating ? 'Validating...' : 'Validate Configuration'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={saveConfig.isLoading}
                    className="btn btn-primary"
                  >
                    {saveConfig.isLoading ? 'Saving...' : config ? 'Update Configuration' : 'Save Configuration'}
                  </button>
                </div>

                {config && (
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(config.updatedAt).toLocaleDateString()}
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