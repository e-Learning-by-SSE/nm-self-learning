/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { z } from 'zod';

export type SkillCreationDto = {
    /**
     * Used to validate that the user is the owner of the target repository.
     */
    owner: string;
    name: string;
    level: number;
    description?: string;
    parentSkills: Array<SkillCreationDto>;
    nestedSkills: Array<SkillCreationDto>;
};

// Generate a zod schema which can be used for validation
export const skillCreationDtoSchema: z.ZodType<SkillCreationDto> =  z.object({
    owner: z.string(),
    name: z.string(),
    level: z.number(),
    description: z.string().optional(),
    parentSkills: z.array(z.lazy(() => skillCreationDtoSchema)),
    nestedSkills: z.array(z.lazy(() => skillCreationDtoSchema)),
});


