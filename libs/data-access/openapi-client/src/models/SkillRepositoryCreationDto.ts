/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import * as z from "zod";
export type SkillRepositoryCreationDto = {
    owner: string;
    name: string;
    description?: string;
    version?: string;
    access_rights?: Record<string, any>;
};

//zod scheme
export const skillRepositoryCreationDtoSchema: z.ZodSchema<SkillRepositoryCreationDto> = z.object({
    owner: z.string(),
    name: z.string(),
    description: z.string().optional(),
    version: z.string().optional(),
    access_rights: z.record(z.any()).optional()
});




