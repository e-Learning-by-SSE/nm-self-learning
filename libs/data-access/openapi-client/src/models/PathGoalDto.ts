/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResolvedSkillDto } from './ResolvedSkillDto';

export type PathGoalDto = {
    id: string;
    title: string;
    targetAudience?: string;
    description?: string;
    requirements: Array<ResolvedSkillDto>;
    pathGoals: Array<ResolvedSkillDto>;
};

