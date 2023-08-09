/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { z } from 'zod';

export type SkillRepositoryDto = {
    owner: string;
    id: string;
    taxonomy?: string;
    description?: string;
    access_rights?: Record<string, any>;
    name: string;
    version?: string;
};


//create zod scheme
export const skillRepositoryDtoSchema = z.object({
    owner: z.string(),
    id: z.string(),
    taxonomy: z.string().optional(),
    description: z.string().optional(),
    access_rights: z.record(z.any()).optional(),
    name: z.string(),
    version: z.string().optional()
});
