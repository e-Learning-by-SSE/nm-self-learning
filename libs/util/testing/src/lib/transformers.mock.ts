/**
 * Vector Store automatically loads the embedding service, which uses the @huggingface/transformers library to generate embeddings.
 * This mocks @huggingface/transformers to avoid loading transformer model during tests.
 *
 * Add this to jest.config.ts of any package (project / library) that may (transitively) import the embedding service as follows:
 * @example
 * ```ts
 * module.exports = {
 *  // ...
 *   moduleNameMapper: {
 *   '^@huggingface/transformers$':
 *     '<rootDir>/../../../libs/util/testing/src/lib/transformers.mock.ts',
 *  },
 * };
 * ```
 *
 * This will prevent errors like:
 * ```ts
 *  /code/node_modules/@huggingface/transformers/src/env.js:49
 *   const __dirname = RUNNING_LOCALLY ? _path.default.dirname(_path.default.dirname(_url.default.fileURLToPath(require("url").pathToFileURL(__filename).toString()))) : './';
 *         ^
 *
 *   SyntaxError: Identifier '__dirname' has already been declared
 *  ```
 */
export type FeatureExtractionPipeline = {
	(input: string | string[], options?: unknown): Promise<unknown>;
};

export const pipeline = jest.fn(async () => {
	return async (input: string | string[]) => {
		const texts = Array.isArray(input) ? input : [input];

		return texts.map(() => ({
			data: new Float32Array([0.1, 0.2, 0.3])
		}));
	};
});
