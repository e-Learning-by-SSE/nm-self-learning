/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResolvedSkillDto } from '../models/ResolvedSkillDto';
import type { ResolvedSkillListDto } from '../models/ResolvedSkillListDto';
import type { ResolvedSkillRepositoryDto } from '../models/ResolvedSkillRepositoryDto';
import type { SkillCreationDto } from '../models/SkillCreationDto';
import type { SkillDto } from '../models/SkillDto';
import type { SkillListDto } from '../models/SkillListDto';
import type { SkillRepositoryCreationDto } from '../models/SkillRepositoryCreationDto';
import type { SkillRepositoryDto } from '../models/SkillRepositoryDto';
import type { SkillRepositoryListDto } from '../models/SkillRepositoryListDto';
import type { SkillRepositorySearchDto } from '../models/SkillRepositorySearchDto';
import type { SkillSearchDto } from '../models/SkillSearchDto';
import type { UnresolvedSkillRepositoryDto } from '../models/UnresolvedSkillRepositoryDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SkillService {

    /**
     * @param requestBody
     * @returns SkillRepositoryListDto
     * @throws ApiError
     */
    public static skillMgmtControllerSearchForRepositories(
        requestBody: SkillRepositorySearchDto,
    ): CancelablePromise<SkillRepositoryListDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/skill-repositories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Lists all repositories of the specified user, without showing its content.
     * @param owner
     * @returns SkillRepositoryListDto
     * @throws ApiError
     */
    public static skillMgmtControllerListRepositories(
        owner: string,
    ): CancelablePromise<SkillRepositoryListDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/skill-repositories/{owner}',
            path: {
                'owner': owner,
            },
        });
    }

    /**
     * Returns one repository and its unresolved elements.
     * Skills and their relations are handled as IDs and need to be resolved on the client-side.
     * @param repositoryId
     * @returns UnresolvedSkillRepositoryDto
     * @throws ApiError
     */
    public static skillMgmtControllerLoadRepository(
        repositoryId: string,
    ): CancelablePromise<UnresolvedSkillRepositoryDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/skill-repositories/byId/{repositoryId}',
            path: {
                'repositoryId': repositoryId,
            },
        });
    }

    /**
     * Lists all skills.
     * @param requestBody
     * @returns SkillListDto
     * @throws ApiError
     */
    public static skillMgmtControllerFindSkills(
        requestBody: SkillSearchDto,
    ): CancelablePromise<SkillListDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/skill-repositories/findSkills',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Returns one resolved repository and its elements.
     * Skills and their relations are resolved at the server.
     * @param repositoryId
     * @returns ResolvedSkillRepositoryDto
     * @throws ApiError
     */
    public static skillMgmtControllerLoadResolvedRepository(
        repositoryId: string,
    ): CancelablePromise<ResolvedSkillRepositoryDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/skill-repositories/resolve/{repositoryId}',
            path: {
                'repositoryId': repositoryId,
            },
        });
    }

    /**
     * Lists all skills.
     * @param requestBody
     * @returns ResolvedSkillListDto
     * @throws ApiError
     */
    public static skillMgmtControllerFindSkillsResolved(
        requestBody: SkillSearchDto,
    ): CancelablePromise<ResolvedSkillListDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/skill-repositories/resolve/findSkills',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Creates a new skill repository for the specified user.
     * @param requestBody
     * @returns SkillRepositoryDto
     * @throws ApiError
     */
    public static skillMgmtControllerCreateRepository(
        requestBody: SkillRepositoryCreationDto,
    ): CancelablePromise<SkillRepositoryDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/skill-repositories/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Creates a new skill at the specified repository and returns the created skill.
     * @param repositoryId
     * @param requestBody
     * @returns SkillDto
     * @throws ApiError
     */
    public static skillMgmtControllerAddSkill(
        repositoryId: string,
        requestBody: SkillCreationDto,
    ): CancelablePromise<SkillDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/skill-repositories/{repositoryId}/skill/add_skill',
            path: {
                'repositoryId': repositoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Returns the specified skill.
     * @param skillId
     * @returns SkillDto
     * @throws ApiError
     */
    public static skillMgmtControllerGetSkill(
        skillId: string,
    ): CancelablePromise<SkillDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/skill-repositories/skill/{skillId}',
            path: {
                'skillId': skillId,
            },
        });
    }

    /**
     * Returns the specified skill.
     * @param skillId
     * @returns ResolvedSkillDto
     * @throws ApiError
     */
    public static skillMgmtControllerGetResolvedSkill(
        skillId: string,
    ): CancelablePromise<ResolvedSkillDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/skill-repositories/resolve/skill/{skillId}',
            path: {
                'skillId': skillId,
            },
        });
    }

    /**
     * Adapts an existing skill and returns the adapted skill.
     * @param repositoryId
     * @param requestBody
     * @returns SkillDto
     * @throws ApiError
     */
    public static skillMgmtControllerAdaptSkill(
        repositoryId: string,
        requestBody: SkillCreationDto,
    ): CancelablePromise<SkillDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/skill-repositories/{repositoryId}/skill/adapt_skill',
            path: {
                'repositoryId': repositoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Deletes the specified skill.
     * @param skillId
     * @returns SkillDto
     * @throws ApiError
     */
    public static skillMgmtControllerDeleteSkill(
        skillId: string
    ): CancelablePromise<SkillDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/skill-repositories/{repositoryId}/skill/del/{skillId}',
            path: {
                'skillId': skillId,
            },
            mediaType: 'application/json',
        });
    }

}
