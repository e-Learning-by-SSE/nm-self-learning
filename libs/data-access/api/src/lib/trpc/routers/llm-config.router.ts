import { z } from 'zod';
import { adminProcedure, t } from '../trpc';
import { database } from '@self-learning/database';
import { TRPCError } from '@trpc/server';

const llmConfigSchema = z.object({
  serverUrl: z.string().url(),
  apiKey: z.string().optional(),
  defaultModel: z.string().min(1),
});

const llmConfigRouter = t.router({
  // Get current LLM configuration
  get: adminProcedure.query(async () => {
    const config = await database.llmConfiguration.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        serverUrl: true,
        defaultModel: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!config) {
      return null;
    }

    // Check if API key exists without exposing it
    const hasApiKey = await database.llmConfiguration.findFirst({
      where: { id: config.id, apiKey: { not: null } },
      select: { id: true },
    });

    return {
      ...config,
      hasApiKey: !!hasApiKey,
      apiKey: hasApiKey ? '****' : undefined, // Masked value
    };
  }),

  // Validate LLM configuration by testing connection
  validate: adminProcedure
    .input(llmConfigSchema)
    .mutation(async ({ input }) => {
      try {
        const { serverUrl, apiKey, defaultModel } = input;
        
        // Test connection by calling /api/tags endpoint
        const tagsUrl = `${serverUrl.replace(/\/$/, '')}/api/tags`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(tagsUrl, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Failed to connect to LLM server: ${response.status} ${response.statusText}`,
          });
        }

        const data = await response.json();
        
        // Check if the specified model is available
        const availableModels = data.models || [];
        const modelExists = availableModels.some((model: any) => 
          model.name === defaultModel || 
          model.name.startsWith(defaultModel + ':')
        );

        if (!modelExists) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Model "${defaultModel}" is not available on the server. Available models: ${availableModels.map((m: any) => m.name).join(', ')}`,
          });
        }

        return {
          valid: true,
          availableModels: availableModels.map((m: any) => m.name),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to validate LLM configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // Create or update LLM configuration
  save: adminProcedure
    .input(llmConfigSchema)
    .mutation(async ({ input }) => {
      try {
        const { serverUrl, apiKey, defaultModel } = input;

        // First validate the configuration by calling the LLM server directly
        try {
          const tagsUrl = `${serverUrl.replace(/\/$/, '')}/api/tags`;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          const response = await fetch(tagsUrl, {
            method: 'GET',
            headers,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Failed to connect to LLM server: ${response.status} ${response.statusText}`,
            });
          }

          const data = await response.json();
          const availableModels = data.models || [];
          const modelExists = availableModels.some((model: any) => 
            model.name === defaultModel || 
            model.name.startsWith(defaultModel + ':')
          );

          if (!modelExists) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Model "${defaultModel}" is not available on the server. Available models: ${availableModels.map((m: any) => m.name).join(', ')}`,
            });
          }
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Failed to validate LLM configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }

        // Check if there's an existing active configuration
        const existingConfig = await database.llmConfiguration.findFirst({
          where: { isActive: true },
        });

        if (existingConfig) {
          // Update existing configuration
          const updatedConfig = await database.llmConfiguration.update({
            where: { id: existingConfig.id },
            data: {
              serverUrl,
              apiKey: apiKey || null,
              defaultModel,
              updatedAt: new Date(),
            },
            select: {
              id: true,
              serverUrl: true,
              defaultModel: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          return {
            ...updatedConfig,
            hasApiKey: !!apiKey,
            apiKey: apiKey ? '****' : undefined,
          };
        } else {
          // Create new configuration
          const newConfig = await database.llmConfiguration.create({
            data: {
              serverUrl,
              apiKey: apiKey || null,
              defaultModel,
              isActive: true,
            },
            select: {
              id: true,
              serverUrl: true,
              defaultModel: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          return {
            ...newConfig,
            hasApiKey: !!apiKey,
            apiKey: apiKey ? '****' : undefined,
          };
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save LLM configuration',
        });
      }
    }),

  // Get available models from the configured server
  getAvailableModels: adminProcedure.query(async () => {
    const config = await database.llmConfiguration.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No LLM configuration found',
      });
    }

    try {
      const tagsUrl = `${config.serverUrl.replace(/\/$/, '')}/api/tags`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(tagsUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Failed to fetch available models: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }),
});

export { llmConfigRouter };