/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SelfLearnLearningUnitDto = {
    selfLearnId: string;
    order?: number;
    title: string;
    /**
     * Should point to a resource (e.g. a website) which contains the learning unit.
     */
    resource: string;
    language: string;
    description?: string;
    teachingGoals: Array<string>;
    requiredSkills: Array<string>;
};

