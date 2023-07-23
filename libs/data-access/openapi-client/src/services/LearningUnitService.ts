/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SelfLearnLearningUnitCreationDto } from '../models/SelfLearnLearningUnitCreationDto';
import type { SelfLearnLearningUnitDto } from '../models/SelfLearnLearningUnitDto';
import type { SelfLearnLearningUnitListDto } from '../models/SelfLearnLearningUnitListDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LearningUnitService {

    /**
     * Lists all learningUnits.
     * @returns SelfLearnLearningUnitListDto
     * @throws ApiError
     */
    public static selfLearnLearningUnitControllerListLearningUnits(): CancelablePromise<SelfLearnLearningUnitListDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/learningUnits/showAllLearningUnits',
        });
    }

    /**
     * Creates a new learningUnit at the specified repository and returns the created learningUnit.
     * @param requestBody
     * @returns SelfLearnLearningUnitDto
     * @throws ApiError
     */
    public static selfLearnLearningUnitControllerAddLearningUnitSelfLearn(
        requestBody: SelfLearnLearningUnitCreationDto,
    ): CancelablePromise<SelfLearnLearningUnitDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/learningUnits/add_learningUnit',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Returns the specified learningUnit.
     * @param learningUnitId
     * @returns SelfLearnLearningUnitDto
     * @throws ApiError
     */
    public static selfLearnLearningUnitControllerGetLearningUnit(
        learningUnitId: string,
    ): CancelablePromise<SelfLearnLearningUnitDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/learningUnits/{learningUnitId}',
            path: {
                'learningUnitId': learningUnitId,
            },
        });
    }

}
