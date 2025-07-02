import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'libs/data-access/api/src/lib/auth/auth';
import { database } from '@self-learning/database';


interface LlmConfigData {
  serverUrl: string;
  apiKey?: string;
  defaultModel: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is admin
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(res: NextApiResponse) {
  try {
    const config = await database.llmConfiguration.findFirst({
      where: { isActive: true }
    });
    
    // Don't expose API key in response
    if (config) {
      const { apiKey, ...configWithoutKey } = config;
      return res.json({ ...configWithoutKey, hasApiKey: !!apiKey });
    }
    
    return res.json(null);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch configuration' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { serverUrl, apiKey, defaultModel }: LlmConfigData = req.body;
    
    // Validate required fields
    if (!serverUrl || !defaultModel) {
      return res.status(400).json({ error: 'Server URL and default model are required' });
    }

    // Deactivate existing configurations
    await database.llmConfiguration.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new configuration
    const config = await database.llmConfiguration.create({
      data: {
        serverUrl,
        apiKey: apiKey || null,
        defaultModel,
        isActive: true
      }
    });

    const { apiKey: _, ...configWithoutKey } = config;
    return res.status(201).json({ ...configWithoutKey, hasApiKey: !!config.apiKey });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create configuration' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { serverUrl, apiKey, defaultModel }: LlmConfigData = req.body;
    
    if (!serverUrl || !defaultModel) {
      return res.status(400).json({ error: 'Server URL and default model are required' });
    }

    const existingConfig = await database.llmConfiguration.findFirst({
      where: { isActive: true }
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'No active configuration found' });
    }

    const updatedConfig = await database.llmConfiguration.update({
      where: { id: existingConfig.id },
      data: {
        serverUrl,
        apiKey: apiKey || null,
        defaultModel
      }
    });

    const { apiKey: _, ...configWithoutKey } = updatedConfig;
    return res.json({ ...configWithoutKey, hasApiKey: !!updatedConfig.apiKey });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update configuration' });
  }
}