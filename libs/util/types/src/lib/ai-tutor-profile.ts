import { z } from "zod";

export const aiTutorProfileSchema = z.object({
	id: z.string().cuid("Invalid ID").optional(),
	name: z.string().min(1, "Name is required"),
	author: z.string().min(1, "Author is required"),
	model: z.string().optional(),
	avatarUrl: z.string().url("Must be a valid URL").optional(),
	systemPrompt: z.string().min(1, "System context is required"),
	description: z.string().optional(),
	updatedAt: z.date().optional()
});

export type AITutorProfile = z.infer<typeof aiTutorProfileSchema>;

// set default values for a new profile
export const defaultAITutorProfile: AITutorProfile = {
	id: undefined,
	name: "",
	description: "",
	author: "",
	model: undefined,
	avatarUrl: undefined,
	systemPrompt: "",
	updatedAt: undefined
};

export const deleteProfileSchema = z.object({
	id: z.string().cuid("Invalid ID")
});

export type ProfileListItem = {
	id: string;
	name: string;
	description: string | null;
	avatarUrl: string | null;
	systemPrompt: string;
	model: string | null;
	author: string;
	createdAt: Date;
	updatedAt: Date;
};

export type SavedProfilesProps = {
	profiles: ProfileListItem[];
	onSelect: (profile: ProfileListItem) => void;
	onNew: () => void;
};

export type ProfileFormHandle = {
	resetForm: (values?: AITutorProfile) => void;
};

export type ProfileFormProps = {
	userName: string | null | undefined;
};
