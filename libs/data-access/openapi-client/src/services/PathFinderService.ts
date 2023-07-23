/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckGraphDto } from '../models/CheckGraphDto';
import type { GraphDto } from '../models/GraphDto';
import type { PathDto } from '../models/PathDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PathFinderService {

    /**
     * @param skillId
     * @returns GraphDto
     * @throws ApiError
     */
    public static pathFinderControllerGetConnectedGraphForSkill(
        skillId: string,
    ): CancelablePromise<GraphDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/PathFinder/getConnectedGraphForSkill/{skillId}',
            path: {
                'skillId': skillId,
            },
        });
    }

    /**
     * @param skillId
     * @returns GraphDto
     * @throws ApiError
     */
    public static pathFinderControllerGetConnectedSkillGraphForSkill(
        skillId: string,
    ): CancelablePromise<GraphDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/PathFinder/getConnectedSkillGraphForSkill/{skillId}',
            path: {
                'skillId': skillId,
            },
        });
    }

    /**
     * @param skillId
     * @returns any
     * @throws ApiError
     */
    public static pathFinderControllerGetConnectedGraphForSkillwithResolvedElements(
        skillId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/PathFinder/getConnectedGraphForSkillwithResolvedElements/{skillId}',
            path: {
                'skillId': skillId,
            },
        });
    }

    /**
     * @param skillId
     * @returns CheckGraphDto
     * @throws ApiError
     */
    public static pathFinderControllerCheckGraph(
        skillId: string,
    ): CancelablePromise<CheckGraphDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/PathFinder/checkGraph/{skillId}',
            path: {
                'skillId': skillId,
            },
        });
    }

    /**
     * @returns PathDto
     * @throws ApiError
     */
    public static pathFinderControllerGetPathToSkill(): CancelablePromise<PathDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/PathFinder/getPathforJava',
        });
    }

    /**
     * @param repoId
     * @returns any
     * @throws ApiError
     */
    public static pathFinderControllerAllSkillsDone(
        repoId: string,
    ): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/PathFinder/allSkillsDone/{repoId}',
            path: {
                'repoId': repoId,
            },
        });
    }

}
