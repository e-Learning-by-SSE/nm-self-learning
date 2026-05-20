import { jest } from "@jest/globals";
import type { extractText as ExtractTextType } from "unpdf";

export const extractText = jest
	.fn<typeof ExtractTextType>()
	.mockResolvedValue({ text: "Mocked PDF text", totalPages: 1 });
