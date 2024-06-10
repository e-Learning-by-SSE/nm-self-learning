import * as z from 'zod';

export const studentSettingsSchema = z.object({
    username: z.string(),
    learningStatistics: z.boolean(),
    hasLearningDiary: z.boolean()
});

export type StudentSettings = z.infer<typeof studentSettingsSchema>;