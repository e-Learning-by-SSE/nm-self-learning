import { z } from "zod";

export const uploadedAssetSchema = z.object({
	objectName: z.string().min(1),
	fileName: z.string().min(1),
	fileType: z.string().min(1),
	publicUrl: z.string().url()
});
