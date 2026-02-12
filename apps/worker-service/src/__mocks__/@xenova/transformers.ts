// apps/worker-service/src/__mocks__/@xenova/transformers.ts

/// <reference types="jest" />

const mockEmbedder = jest.fn().mockImplementation(async (text: string, options?: any) => {
	return {
		data: new Float32Array(384).fill(0.1)
	};
});

export const pipeline = jest.fn().mockResolvedValue(mockEmbedder);

export default {
	pipeline
};
