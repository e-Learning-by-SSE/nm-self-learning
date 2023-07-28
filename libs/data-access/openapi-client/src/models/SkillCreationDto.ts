/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import * as z from "zod";

export type SkillCreationDto = {
    /**
     * Used to validate that the user is the owner of the target repository.
     */
    owner: string;
    name: string;
    level: number;
    description?: string;
    nestedSkills: Array<SkillCreationDto>;
};

//zod scheme
export const skillCreationDtoSchema: z.ZodSchema<SkillCreationDto> = z.object({
    owner: z.string(),
    name: z.string(),
    level: z.number(),
    description: z.string().optional(),
    nestedSkills: z.array(z.lazy(() => skillCreationDtoSchema))
});

