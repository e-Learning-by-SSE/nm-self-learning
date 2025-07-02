import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CenteredSection } from '@self-learning/ui/layouts';

interface LlmConfig {
  id: string;
  serverUrl: string;
  defaultModel: string;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LlmConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<LlmConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    serverUrl: '',
    apiKey: '',
    defaultModel: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }

    fetchConfig();
  }, [session, status, router]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/llm-config');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfig(data);
          setFormData({
            serverUrl: data.serverUrl,
            apiKey: '', // Don't populate API key for security
            defaultModel: data.defaultModel
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = config ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/llm-config', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        alert('Configuration saved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    if (loading) {
        return <div className="text-center">Loading...</div>;
  }

  return (
    <CenteredSection className="bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">LLM Server Configuration</h1>
        
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://your-llm-server.com/api"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <input
              type="text"
              id="defaultModel"
              name="defaultModel"
              value={formData.defaultModel}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="gpt-3.5-turbo, claude-3-sonnet, etc."
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : config ? 'Update Configuration' : 'Save Configuration'}
            </button>

            {config && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date(config.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </form>
      </div>
    </CenteredSection>
  );
}