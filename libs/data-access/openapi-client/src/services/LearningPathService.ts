/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LearningPathCreationDto } from '../models/LearningPathCreationDto';
import type { LearningPathDto } from '../models/LearningPathDto';
import type { LearningPathListDto } from '../models/LearningPathListDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LearningPathService {

    /**
     * Lists all learning paths.
     * @returns LearningPathListDto
     * @throws ApiError
     */
    public static learningPathMgmtControllerListLearningPaths(): CancelablePromise<LearningPathListDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/learningpaths/showAllLearningPaths',
        });
    }

    /**
     * Creates a new learningpath at the specified repository and returns the created learningpath.
     * @param requestBody
     * @returns LearningPathDto
     * @throws ApiError
     */
    public static learningPathMgmtControllerAddLearningpath(
        requestBody: LearningPathCreationDto,
    ): CancelablePromise<LearningPathDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/learningpaths/add_learningpath',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Returns the specified learningpath.
     * @param learningpathId
     * @returns LearningPathDto
     * @throws ApiError
     */
    public static learningPathMgmtControllerGetLearningPath(
        learningpathId: string,
    ): CancelablePromise<LearningPathDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/learningpaths/{learningpathId}',
            path: {
                'learningpathId': learningpathId,
            },
        });
    }

}
