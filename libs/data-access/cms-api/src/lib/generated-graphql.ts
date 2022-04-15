import { GraphQLClient } from "graphql-request";
import * as Dom from "graphql-request/dist/types.dom";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	CourseContentDynamicZoneInput: any;
	/** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
	DateTime: any;
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
	JSON: any;
	NanomoduleContentDynamicZoneInput: any;
	/** The `Upload` scalar type represents a file upload. */
	Upload: any;
};

export type Author = {
	__typename?: "Author";
	courses?: Maybe<CourseRelationResponseCollection>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	image?: Maybe<UploadFileEntityResponse>;
	name: Scalars["String"];
	nanomodules?: Maybe<NanomoduleRelationResponseCollection>;
	slug: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type AuthorCoursesArgs = {
	filters?: InputMaybe<CourseFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	publicationState?: InputMaybe<PublicationState>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type AuthorNanomodulesArgs = {
	filters?: InputMaybe<NanomoduleFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type AuthorEntity = {
	__typename?: "AuthorEntity";
	attributes?: Maybe<Author>;
	id?: Maybe<Scalars["ID"]>;
};

export type AuthorEntityResponse = {
	__typename?: "AuthorEntityResponse";
	data?: Maybe<AuthorEntity>;
};

export type AuthorEntityResponseCollection = {
	__typename?: "AuthorEntityResponseCollection";
	data: Array<AuthorEntity>;
	meta: ResponseCollectionMeta;
};

export type AuthorFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<AuthorFiltersInput>>>;
	courses?: InputMaybe<CourseFiltersInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	name?: InputMaybe<StringFilterInput>;
	nanomodules?: InputMaybe<NanomoduleFiltersInput>;
	not?: InputMaybe<AuthorFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<AuthorFiltersInput>>>;
	slug?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type AuthorInput = {
	courses?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	image?: InputMaybe<Scalars["ID"]>;
	name?: InputMaybe<Scalars["String"]>;
	nanomodules?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	slug?: InputMaybe<Scalars["String"]>;
};

export type AuthorRelationResponseCollection = {
	__typename?: "AuthorRelationResponseCollection";
	data: Array<AuthorEntity>;
};

export type BooleanFilterInput = {
	and?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]>>>;
	between?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]>>>;
	contains?: InputMaybe<Scalars["Boolean"]>;
	containsi?: InputMaybe<Scalars["Boolean"]>;
	endsWith?: InputMaybe<Scalars["Boolean"]>;
	eq?: InputMaybe<Scalars["Boolean"]>;
	gt?: InputMaybe<Scalars["Boolean"]>;
	gte?: InputMaybe<Scalars["Boolean"]>;
	in?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]>>>;
	lt?: InputMaybe<Scalars["Boolean"]>;
	lte?: InputMaybe<Scalars["Boolean"]>;
	ne?: InputMaybe<Scalars["Boolean"]>;
	not?: InputMaybe<BooleanFilterInput>;
	notContains?: InputMaybe<Scalars["Boolean"]>;
	notContainsi?: InputMaybe<Scalars["Boolean"]>;
	notIn?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]>>>;
	notNull?: InputMaybe<Scalars["Boolean"]>;
	null?: InputMaybe<Scalars["Boolean"]>;
	or?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]>>>;
	startsWith?: InputMaybe<Scalars["Boolean"]>;
};

export type ComponentNanomoduleArticle = {
	__typename?: "ComponentNanomoduleArticle";
	id: Scalars["ID"];
	richText: Scalars["String"];
};

export type ComponentNanomoduleChapter = {
	__typename?: "ComponentNanomoduleChapter";
	courses?: Maybe<CourseRelationResponseCollection>;
	id: Scalars["ID"];
	lessons?: Maybe<NanomoduleRelationResponseCollection>;
	title: Scalars["String"];
};

export type ComponentNanomoduleChapterCoursesArgs = {
	filters?: InputMaybe<CourseFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	publicationState?: InputMaybe<PublicationState>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type ComponentNanomoduleChapterLessonsArgs = {
	filters?: InputMaybe<NanomoduleFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type ComponentNanomoduleNanomoduleRelation = {
	__typename?: "ComponentNanomoduleNanomoduleRelation";
	id: Scalars["ID"];
	nanomodule?: Maybe<NanomoduleEntityResponse>;
};

export type ComponentNanomoduleVideo = {
	__typename?: "ComponentNanomoduleVideo";
	id: Scalars["ID"];
	video: UploadFileEntityResponse;
};

export type ComponentNanomoduleYoutubeVideo = {
	__typename?: "ComponentNanomoduleYoutubeVideo";
	id: Scalars["ID"];
	url?: Maybe<Scalars["String"]>;
};

export type Course = {
	__typename?: "Course";
	authors?: Maybe<AuthorRelationResponseCollection>;
	content?: Maybe<Array<Maybe<CourseContentDynamicZone>>>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	image?: Maybe<UploadFileEntityResponse>;
	publishedAt?: Maybe<Scalars["DateTime"]>;
	slug: Scalars["String"];
	subtitle?: Maybe<Scalars["String"]>;
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type CourseAuthorsArgs = {
	filters?: InputMaybe<AuthorFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type CourseContentDynamicZone =
	| ComponentNanomoduleChapter
	| ComponentNanomoduleNanomoduleRelation
	| Error;

export type CourseEntity = {
	__typename?: "CourseEntity";
	attributes?: Maybe<Course>;
	id?: Maybe<Scalars["ID"]>;
};

export type CourseEntityResponse = {
	__typename?: "CourseEntityResponse";
	data?: Maybe<CourseEntity>;
};

export type CourseEntityResponseCollection = {
	__typename?: "CourseEntityResponseCollection";
	data: Array<CourseEntity>;
	meta: ResponseCollectionMeta;
};

export type CourseFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<CourseFiltersInput>>>;
	authors?: InputMaybe<AuthorFiltersInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<CourseFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<CourseFiltersInput>>>;
	publishedAt?: InputMaybe<DateTimeFilterInput>;
	slug?: InputMaybe<StringFilterInput>;
	subtitle?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type CourseInput = {
	authors?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	content?: InputMaybe<Array<Scalars["CourseContentDynamicZoneInput"]>>;
	description?: InputMaybe<Scalars["String"]>;
	image?: InputMaybe<Scalars["ID"]>;
	publishedAt?: InputMaybe<Scalars["DateTime"]>;
	slug?: InputMaybe<Scalars["String"]>;
	subtitle?: InputMaybe<Scalars["String"]>;
	title?: InputMaybe<Scalars["String"]>;
};

export type CourseRelationResponseCollection = {
	__typename?: "CourseRelationResponseCollection";
	data: Array<CourseEntity>;
};

export type DateTimeFilterInput = {
	and?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]>>>;
	between?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]>>>;
	contains?: InputMaybe<Scalars["DateTime"]>;
	containsi?: InputMaybe<Scalars["DateTime"]>;
	endsWith?: InputMaybe<Scalars["DateTime"]>;
	eq?: InputMaybe<Scalars["DateTime"]>;
	gt?: InputMaybe<Scalars["DateTime"]>;
	gte?: InputMaybe<Scalars["DateTime"]>;
	in?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]>>>;
	lt?: InputMaybe<Scalars["DateTime"]>;
	lte?: InputMaybe<Scalars["DateTime"]>;
	ne?: InputMaybe<Scalars["DateTime"]>;
	not?: InputMaybe<DateTimeFilterInput>;
	notContains?: InputMaybe<Scalars["DateTime"]>;
	notContainsi?: InputMaybe<Scalars["DateTime"]>;
	notIn?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]>>>;
	notNull?: InputMaybe<Scalars["Boolean"]>;
	null?: InputMaybe<Scalars["Boolean"]>;
	or?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]>>>;
	startsWith?: InputMaybe<Scalars["DateTime"]>;
};

export type Error = {
	__typename?: "Error";
	code: Scalars["String"];
	message?: Maybe<Scalars["String"]>;
};

export type FileInfoInput = {
	alternativeText?: InputMaybe<Scalars["String"]>;
	caption?: InputMaybe<Scalars["String"]>;
	name?: InputMaybe<Scalars["String"]>;
};

export type FloatFilterInput = {
	and?: InputMaybe<Array<InputMaybe<Scalars["Float"]>>>;
	between?: InputMaybe<Array<InputMaybe<Scalars["Float"]>>>;
	contains?: InputMaybe<Scalars["Float"]>;
	containsi?: InputMaybe<Scalars["Float"]>;
	endsWith?: InputMaybe<Scalars["Float"]>;
	eq?: InputMaybe<Scalars["Float"]>;
	gt?: InputMaybe<Scalars["Float"]>;
	gte?: InputMaybe<Scalars["Float"]>;
	in?: InputMaybe<Array<InputMaybe<Scalars["Float"]>>>;
	lt?: InputMaybe<Scalars["Float"]>;
	lte?: InputMaybe<Scalars["Float"]>;
	ne?: InputMaybe<Scalars["Float"]>;
	not?: InputMaybe<FloatFilterInput>;
	notContains?: InputMaybe<Scalars["Float"]>;
	notContainsi?: InputMaybe<Scalars["Float"]>;
	notIn?: InputMaybe<Array<InputMaybe<Scalars["Float"]>>>;
	notNull?: InputMaybe<Scalars["Boolean"]>;
	null?: InputMaybe<Scalars["Boolean"]>;
	or?: InputMaybe<Array<InputMaybe<Scalars["Float"]>>>;
	startsWith?: InputMaybe<Scalars["Float"]>;
};

export type GenericMorph =
	| Author
	| ComponentNanomoduleArticle
	| ComponentNanomoduleChapter
	| ComponentNanomoduleNanomoduleRelation
	| ComponentNanomoduleVideo
	| ComponentNanomoduleYoutubeVideo
	| Course
	| I18NLocale
	| Nanomodule
	| UploadFile
	| UsersPermissionsPermission
	| UsersPermissionsRole
	| UsersPermissionsUser;

export type I18NLocale = {
	__typename?: "I18NLocale";
	code?: Maybe<Scalars["String"]>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	name?: Maybe<Scalars["String"]>;
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type I18NLocaleEntity = {
	__typename?: "I18NLocaleEntity";
	attributes?: Maybe<I18NLocale>;
	id?: Maybe<Scalars["ID"]>;
};

export type I18NLocaleEntityResponse = {
	__typename?: "I18NLocaleEntityResponse";
	data?: Maybe<I18NLocaleEntity>;
};

export type I18NLocaleEntityResponseCollection = {
	__typename?: "I18NLocaleEntityResponseCollection";
	data: Array<I18NLocaleEntity>;
	meta: ResponseCollectionMeta;
};

export type I18NLocaleFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
	code?: InputMaybe<StringFilterInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	name?: InputMaybe<StringFilterInput>;
	not?: InputMaybe<I18NLocaleFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type IdFilterInput = {
	and?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	between?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	contains?: InputMaybe<Scalars["ID"]>;
	containsi?: InputMaybe<Scalars["ID"]>;
	endsWith?: InputMaybe<Scalars["ID"]>;
	eq?: InputMaybe<Scalars["ID"]>;
	gt?: InputMaybe<Scalars["ID"]>;
	gte?: InputMaybe<Scalars["ID"]>;
	in?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	lt?: InputMaybe<Scalars["ID"]>;
	lte?: InputMaybe<Scalars["ID"]>;
	ne?: InputMaybe<Scalars["ID"]>;
	not?: InputMaybe<IdFilterInput>;
	notContains?: InputMaybe<Scalars["ID"]>;
	notContainsi?: InputMaybe<Scalars["ID"]>;
	notIn?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	notNull?: InputMaybe<Scalars["Boolean"]>;
	null?: InputMaybe<Scalars["Boolean"]>;
	or?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	startsWith?: InputMaybe<Scalars["ID"]>;
};

export type IntFilterInput = {
	and?: InputMaybe<Array<InputMaybe<Scalars["Int"]>>>;
	between?: InputMaybe<Array<InputMaybe<Scalars["Int"]>>>;
	contains?: InputMaybe<Scalars["Int"]>;
	containsi?: InputMaybe<Scalars["Int"]>;
	endsWith?: InputMaybe<Scalars["Int"]>;
	eq?: InputMaybe<Scalars["Int"]>;
	gt?: InputMaybe<Scalars["Int"]>;
	gte?: InputMaybe<Scalars["Int"]>;
	in?: InputMaybe<Array<InputMaybe<Scalars["Int"]>>>;
	lt?: InputMaybe<Scalars["Int"]>;
	lte?: InputMaybe<Scalars["Int"]>;
	ne?: InputMaybe<Scalars["Int"]>;
	not?: InputMaybe<IntFilterInput>;
	notContains?: InputMaybe<Scalars["Int"]>;
	notContainsi?: InputMaybe<Scalars["Int"]>;
	notIn?: InputMaybe<Array<InputMaybe<Scalars["Int"]>>>;
	notNull?: InputMaybe<Scalars["Boolean"]>;
	null?: InputMaybe<Scalars["Boolean"]>;
	or?: InputMaybe<Array<InputMaybe<Scalars["Int"]>>>;
	startsWith?: InputMaybe<Scalars["Int"]>;
};

export type JsonFilterInput = {
	and?: InputMaybe<Array<InputMaybe<Scalars["JSON"]>>>;
	between?: InputMaybe<Array<InputMaybe<Scalars["JSON"]>>>;
	contains?: InputMaybe<Scalars["JSON"]>;
	containsi?: InputMaybe<Scalars["JSON"]>;
	endsWith?: InputMaybe<Scalars["JSON"]>;
	eq?: InputMaybe<Scalars["JSON"]>;
	gt?: InputMaybe<Scalars["JSON"]>;
	gte?: InputMaybe<Scalars["JSON"]>;
	in?: InputMaybe<Array<InputMaybe<Scalars["JSON"]>>>;
	lt?: InputMaybe<Scalars["JSON"]>;
	lte?: InputMaybe<Scalars["JSON"]>;
	ne?: InputMaybe<Scalars["JSON"]>;
	not?: InputMaybe<JsonFilterInput>;
	notContains?: InputMaybe<Scalars["JSON"]>;
	notContainsi?: InputMaybe<Scalars["JSON"]>;
	notIn?: InputMaybe<Array<InputMaybe<Scalars["JSON"]>>>;
	notNull?: InputMaybe<Scalars["Boolean"]>;
	null?: InputMaybe<Scalars["Boolean"]>;
	or?: InputMaybe<Array<InputMaybe<Scalars["JSON"]>>>;
	startsWith?: InputMaybe<Scalars["JSON"]>;
};

export type Mutation = {
	__typename?: "Mutation";
	createAuthor?: Maybe<AuthorEntityResponse>;
	createCourse?: Maybe<CourseEntityResponse>;
	createNanomodule?: Maybe<NanomoduleEntityResponse>;
	createUploadFile?: Maybe<UploadFileEntityResponse>;
	/** Create a new role */
	createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>;
	/** Create a new user */
	createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
	deleteAuthor?: Maybe<AuthorEntityResponse>;
	deleteCourse?: Maybe<CourseEntityResponse>;
	deleteNanomodule?: Maybe<NanomoduleEntityResponse>;
	deleteUploadFile?: Maybe<UploadFileEntityResponse>;
	/** Delete an existing role */
	deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>;
	/** Update an existing user */
	deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
	/** Confirm an email users email address */
	emailConfirmation?: Maybe<UsersPermissionsLoginPayload>;
	/** Request a reset password token */
	forgotPassword?: Maybe<UsersPermissionsPasswordPayload>;
	login: UsersPermissionsLoginPayload;
	multipleUpload: Array<Maybe<UploadFileEntityResponse>>;
	/** Register a user */
	register: UsersPermissionsLoginPayload;
	removeFile?: Maybe<UploadFileEntityResponse>;
	/** Reset user password. Confirm with a code (resetToken from forgotPassword) */
	resetPassword?: Maybe<UsersPermissionsLoginPayload>;
	updateAuthor?: Maybe<AuthorEntityResponse>;
	updateCourse?: Maybe<CourseEntityResponse>;
	updateFileInfo: UploadFileEntityResponse;
	updateNanomodule?: Maybe<NanomoduleEntityResponse>;
	updateUploadFile?: Maybe<UploadFileEntityResponse>;
	/** Update an existing role */
	updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>;
	/** Update an existing user */
	updateUsersPermissionsUser: UsersPermissionsUserEntityResponse;
	upload: UploadFileEntityResponse;
};

export type MutationCreateAuthorArgs = {
	data: AuthorInput;
};

export type MutationCreateCourseArgs = {
	data: CourseInput;
};

export type MutationCreateNanomoduleArgs = {
	data: NanomoduleInput;
};

export type MutationCreateUploadFileArgs = {
	data: UploadFileInput;
};

export type MutationCreateUsersPermissionsRoleArgs = {
	data: UsersPermissionsRoleInput;
};

export type MutationCreateUsersPermissionsUserArgs = {
	data: UsersPermissionsUserInput;
};

export type MutationDeleteAuthorArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteCourseArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteNanomoduleArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteUploadFileArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteUsersPermissionsRoleArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteUsersPermissionsUserArgs = {
	id: Scalars["ID"];
};

export type MutationEmailConfirmationArgs = {
	confirmation: Scalars["String"];
};

export type MutationForgotPasswordArgs = {
	email: Scalars["String"];
};

export type MutationLoginArgs = {
	input: UsersPermissionsLoginInput;
};

export type MutationMultipleUploadArgs = {
	field?: InputMaybe<Scalars["String"]>;
	files: Array<InputMaybe<Scalars["Upload"]>>;
	ref?: InputMaybe<Scalars["String"]>;
	refId?: InputMaybe<Scalars["ID"]>;
};

export type MutationRegisterArgs = {
	input: UsersPermissionsRegisterInput;
};

export type MutationRemoveFileArgs = {
	id: Scalars["ID"];
};

export type MutationResetPasswordArgs = {
	code: Scalars["String"];
	password: Scalars["String"];
	passwordConfirmation: Scalars["String"];
};

export type MutationUpdateAuthorArgs = {
	data: AuthorInput;
	id: Scalars["ID"];
};

export type MutationUpdateCourseArgs = {
	data: CourseInput;
	id: Scalars["ID"];
};

export type MutationUpdateFileInfoArgs = {
	id: Scalars["ID"];
	info?: InputMaybe<FileInfoInput>;
};

export type MutationUpdateNanomoduleArgs = {
	data: NanomoduleInput;
	id: Scalars["ID"];
};

export type MutationUpdateUploadFileArgs = {
	data: UploadFileInput;
	id: Scalars["ID"];
};

export type MutationUpdateUsersPermissionsRoleArgs = {
	data: UsersPermissionsRoleInput;
	id: Scalars["ID"];
};

export type MutationUpdateUsersPermissionsUserArgs = {
	data: UsersPermissionsUserInput;
	id: Scalars["ID"];
};

export type MutationUploadArgs = {
	field?: InputMaybe<Scalars["String"]>;
	file: Scalars["Upload"];
	info?: InputMaybe<FileInfoInput>;
	ref?: InputMaybe<Scalars["String"]>;
	refId?: InputMaybe<Scalars["ID"]>;
};

export type Nanomodule = {
	__typename?: "Nanomodule";
	authors?: Maybe<AuthorRelationResponseCollection>;
	content: Array<Maybe<NanomoduleContentDynamicZone>>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	image?: Maybe<UploadFileEntityResponse>;
	meta?: Maybe<Scalars["JSON"]>;
	questions?: Maybe<Scalars["JSON"]>;
	slug: Scalars["String"];
	subtitle?: Maybe<Scalars["String"]>;
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type NanomoduleAuthorsArgs = {
	filters?: InputMaybe<AuthorFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type NanomoduleContentDynamicZone =
	| ComponentNanomoduleArticle
	| ComponentNanomoduleVideo
	| ComponentNanomoduleYoutubeVideo
	| Error;

export type NanomoduleEntity = {
	__typename?: "NanomoduleEntity";
	attributes?: Maybe<Nanomodule>;
	id?: Maybe<Scalars["ID"]>;
};

export type NanomoduleEntityResponse = {
	__typename?: "NanomoduleEntityResponse";
	data?: Maybe<NanomoduleEntity>;
};

export type NanomoduleEntityResponseCollection = {
	__typename?: "NanomoduleEntityResponseCollection";
	data: Array<NanomoduleEntity>;
	meta: ResponseCollectionMeta;
};

export type NanomoduleFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<NanomoduleFiltersInput>>>;
	authors?: InputMaybe<AuthorFiltersInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	meta?: InputMaybe<JsonFilterInput>;
	not?: InputMaybe<NanomoduleFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<NanomoduleFiltersInput>>>;
	questions?: InputMaybe<JsonFilterInput>;
	slug?: InputMaybe<StringFilterInput>;
	subtitle?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type NanomoduleInput = {
	authors?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	content?: InputMaybe<Array<Scalars["NanomoduleContentDynamicZoneInput"]>>;
	description?: InputMaybe<Scalars["String"]>;
	image?: InputMaybe<Scalars["ID"]>;
	meta?: InputMaybe<Scalars["JSON"]>;
	questions?: InputMaybe<Scalars["JSON"]>;
	slug?: InputMaybe<Scalars["String"]>;
	subtitle?: InputMaybe<Scalars["String"]>;
	title?: InputMaybe<Scalars["String"]>;
};

export type NanomoduleRelationResponseCollection = {
	__typename?: "NanomoduleRelationResponseCollection";
	data: Array<NanomoduleEntity>;
};

export type Pagination = {
	__typename?: "Pagination";
	page: Scalars["Int"];
	pageCount: Scalars["Int"];
	pageSize: Scalars["Int"];
	total: Scalars["Int"];
};

export type PaginationArg = {
	limit?: InputMaybe<Scalars["Int"]>;
	page?: InputMaybe<Scalars["Int"]>;
	pageSize?: InputMaybe<Scalars["Int"]>;
	start?: InputMaybe<Scalars["Int"]>;
};

export enum PublicationState {
	Live = "LIVE",
	Preview = "PREVIEW"
}

export type Query = {
	__typename?: "Query";
	author?: Maybe<AuthorEntityResponse>;
	authors?: Maybe<AuthorEntityResponseCollection>;
	course?: Maybe<CourseEntityResponse>;
	courses?: Maybe<CourseEntityResponseCollection>;
	i18NLocale?: Maybe<I18NLocaleEntityResponse>;
	i18NLocales?: Maybe<I18NLocaleEntityResponseCollection>;
	me?: Maybe<UsersPermissionsMe>;
	nanomodule?: Maybe<NanomoduleEntityResponse>;
	nanomodules?: Maybe<NanomoduleEntityResponseCollection>;
	uploadFile?: Maybe<UploadFileEntityResponse>;
	uploadFiles?: Maybe<UploadFileEntityResponseCollection>;
	usersPermissionsRole?: Maybe<UsersPermissionsRoleEntityResponse>;
	usersPermissionsRoles?: Maybe<UsersPermissionsRoleEntityResponseCollection>;
	usersPermissionsUser?: Maybe<UsersPermissionsUserEntityResponse>;
	usersPermissionsUsers?: Maybe<UsersPermissionsUserEntityResponseCollection>;
};

export type QueryAuthorArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryAuthorsArgs = {
	filters?: InputMaybe<AuthorFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryCourseArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryCoursesArgs = {
	filters?: InputMaybe<CourseFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	publicationState?: InputMaybe<PublicationState>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryI18NLocaleArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryI18NLocalesArgs = {
	filters?: InputMaybe<I18NLocaleFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryNanomoduleArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryNanomodulesArgs = {
	filters?: InputMaybe<NanomoduleFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryUploadFileArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryUploadFilesArgs = {
	filters?: InputMaybe<UploadFileFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryUsersPermissionsRoleArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryUsersPermissionsRolesArgs = {
	filters?: InputMaybe<UsersPermissionsRoleFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryUsersPermissionsUserArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryUsersPermissionsUsersArgs = {
	filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type ResponseCollectionMeta = {
	__typename?: "ResponseCollectionMeta";
	pagination: Pagination;
};

export type StringFilterInput = {
	and?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
	between?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
	contains?: InputMaybe<Scalars["String"]>;
	containsi?: InputMaybe<Scalars["String"]>;
	endsWith?: InputMaybe<Scalars["String"]>;
	eq?: InputMaybe<Scalars["String"]>;
	gt?: InputMaybe<Scalars["String"]>;
	gte?: InputMaybe<Scalars["String"]>;
	in?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
	lt?: InputMaybe<Scalars["String"]>;
	lte?: InputMaybe<Scalars["String"]>;
	ne?: InputMaybe<Scalars["String"]>;
	not?: InputMaybe<StringFilterInput>;
	notContains?: InputMaybe<Scalars["String"]>;
	notContainsi?: InputMaybe<Scalars["String"]>;
	notIn?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
	notNull?: InputMaybe<Scalars["Boolean"]>;
	null?: InputMaybe<Scalars["Boolean"]>;
	or?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
	startsWith?: InputMaybe<Scalars["String"]>;
};

export type UploadFile = {
	__typename?: "UploadFile";
	alternativeText?: Maybe<Scalars["String"]>;
	caption?: Maybe<Scalars["String"]>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	ext?: Maybe<Scalars["String"]>;
	formats?: Maybe<Scalars["JSON"]>;
	hash: Scalars["String"];
	height?: Maybe<Scalars["Int"]>;
	mime: Scalars["String"];
	name: Scalars["String"];
	previewUrl?: Maybe<Scalars["String"]>;
	provider: Scalars["String"];
	provider_metadata?: Maybe<Scalars["JSON"]>;
	related?: Maybe<Array<Maybe<GenericMorph>>>;
	size: Scalars["Float"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
	url: Scalars["String"];
	width?: Maybe<Scalars["Int"]>;
};

export type UploadFileEntity = {
	__typename?: "UploadFileEntity";
	attributes?: Maybe<UploadFile>;
	id?: Maybe<Scalars["ID"]>;
};

export type UploadFileEntityResponse = {
	__typename?: "UploadFileEntityResponse";
	data?: Maybe<UploadFileEntity>;
};

export type UploadFileEntityResponseCollection = {
	__typename?: "UploadFileEntityResponseCollection";
	data: Array<UploadFileEntity>;
	meta: ResponseCollectionMeta;
};

export type UploadFileFiltersInput = {
	alternativeText?: InputMaybe<StringFilterInput>;
	and?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
	caption?: InputMaybe<StringFilterInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	ext?: InputMaybe<StringFilterInput>;
	formats?: InputMaybe<JsonFilterInput>;
	hash?: InputMaybe<StringFilterInput>;
	height?: InputMaybe<IntFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	mime?: InputMaybe<StringFilterInput>;
	name?: InputMaybe<StringFilterInput>;
	not?: InputMaybe<UploadFileFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
	previewUrl?: InputMaybe<StringFilterInput>;
	provider?: InputMaybe<StringFilterInput>;
	provider_metadata?: InputMaybe<JsonFilterInput>;
	size?: InputMaybe<FloatFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
	url?: InputMaybe<StringFilterInput>;
	width?: InputMaybe<IntFilterInput>;
};

export type UploadFileInput = {
	alternativeText?: InputMaybe<Scalars["String"]>;
	caption?: InputMaybe<Scalars["String"]>;
	ext?: InputMaybe<Scalars["String"]>;
	formats?: InputMaybe<Scalars["JSON"]>;
	hash?: InputMaybe<Scalars["String"]>;
	height?: InputMaybe<Scalars["Int"]>;
	mime?: InputMaybe<Scalars["String"]>;
	name?: InputMaybe<Scalars["String"]>;
	previewUrl?: InputMaybe<Scalars["String"]>;
	provider?: InputMaybe<Scalars["String"]>;
	provider_metadata?: InputMaybe<Scalars["JSON"]>;
	size?: InputMaybe<Scalars["Float"]>;
	url?: InputMaybe<Scalars["String"]>;
	width?: InputMaybe<Scalars["Int"]>;
};

export type UsersPermissionsCreateRolePayload = {
	__typename?: "UsersPermissionsCreateRolePayload";
	ok: Scalars["Boolean"];
};

export type UsersPermissionsDeleteRolePayload = {
	__typename?: "UsersPermissionsDeleteRolePayload";
	ok: Scalars["Boolean"];
};

export type UsersPermissionsLoginInput = {
	identifier: Scalars["String"];
	password: Scalars["String"];
	provider?: Scalars["String"];
};

export type UsersPermissionsLoginPayload = {
	__typename?: "UsersPermissionsLoginPayload";
	jwt?: Maybe<Scalars["String"]>;
	user: UsersPermissionsMe;
};

export type UsersPermissionsMe = {
	__typename?: "UsersPermissionsMe";
	blocked?: Maybe<Scalars["Boolean"]>;
	confirmed?: Maybe<Scalars["Boolean"]>;
	email?: Maybe<Scalars["String"]>;
	id: Scalars["ID"];
	role?: Maybe<UsersPermissionsMeRole>;
	username: Scalars["String"];
};

export type UsersPermissionsMeRole = {
	__typename?: "UsersPermissionsMeRole";
	description?: Maybe<Scalars["String"]>;
	id: Scalars["ID"];
	name: Scalars["String"];
	type?: Maybe<Scalars["String"]>;
};

export type UsersPermissionsPasswordPayload = {
	__typename?: "UsersPermissionsPasswordPayload";
	ok: Scalars["Boolean"];
};

export type UsersPermissionsPermission = {
	__typename?: "UsersPermissionsPermission";
	action: Scalars["String"];
	createdAt?: Maybe<Scalars["DateTime"]>;
	role?: Maybe<UsersPermissionsRoleEntityResponse>;
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type UsersPermissionsPermissionEntity = {
	__typename?: "UsersPermissionsPermissionEntity";
	attributes?: Maybe<UsersPermissionsPermission>;
	id?: Maybe<Scalars["ID"]>;
};

export type UsersPermissionsPermissionFiltersInput = {
	action?: InputMaybe<StringFilterInput>;
	and?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
	role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type UsersPermissionsPermissionRelationResponseCollection = {
	__typename?: "UsersPermissionsPermissionRelationResponseCollection";
	data: Array<UsersPermissionsPermissionEntity>;
};

export type UsersPermissionsRegisterInput = {
	email: Scalars["String"];
	password: Scalars["String"];
	username: Scalars["String"];
};

export type UsersPermissionsRole = {
	__typename?: "UsersPermissionsRole";
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	name: Scalars["String"];
	permissions?: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
	type?: Maybe<Scalars["String"]>;
	updatedAt?: Maybe<Scalars["DateTime"]>;
	users?: Maybe<UsersPermissionsUserRelationResponseCollection>;
};

export type UsersPermissionsRolePermissionsArgs = {
	filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type UsersPermissionsRoleUsersArgs = {
	filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type UsersPermissionsRoleEntity = {
	__typename?: "UsersPermissionsRoleEntity";
	attributes?: Maybe<UsersPermissionsRole>;
	id?: Maybe<Scalars["ID"]>;
};

export type UsersPermissionsRoleEntityResponse = {
	__typename?: "UsersPermissionsRoleEntityResponse";
	data?: Maybe<UsersPermissionsRoleEntity>;
};

export type UsersPermissionsRoleEntityResponseCollection = {
	__typename?: "UsersPermissionsRoleEntityResponseCollection";
	data: Array<UsersPermissionsRoleEntity>;
	meta: ResponseCollectionMeta;
};

export type UsersPermissionsRoleFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	name?: InputMaybe<StringFilterInput>;
	not?: InputMaybe<UsersPermissionsRoleFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
	permissions?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
	type?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
	users?: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type UsersPermissionsRoleInput = {
	description?: InputMaybe<Scalars["String"]>;
	name?: InputMaybe<Scalars["String"]>;
	permissions?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	type?: InputMaybe<Scalars["String"]>;
	users?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
};

export type UsersPermissionsUpdateRolePayload = {
	__typename?: "UsersPermissionsUpdateRolePayload";
	ok: Scalars["Boolean"];
};

export type UsersPermissionsUser = {
	__typename?: "UsersPermissionsUser";
	blocked?: Maybe<Scalars["Boolean"]>;
	confirmed?: Maybe<Scalars["Boolean"]>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	email: Scalars["String"];
	provider?: Maybe<Scalars["String"]>;
	role?: Maybe<UsersPermissionsRoleEntityResponse>;
	updatedAt?: Maybe<Scalars["DateTime"]>;
	username: Scalars["String"];
};

export type UsersPermissionsUserEntity = {
	__typename?: "UsersPermissionsUserEntity";
	attributes?: Maybe<UsersPermissionsUser>;
	id?: Maybe<Scalars["ID"]>;
};

export type UsersPermissionsUserEntityResponse = {
	__typename?: "UsersPermissionsUserEntityResponse";
	data?: Maybe<UsersPermissionsUserEntity>;
};

export type UsersPermissionsUserEntityResponseCollection = {
	__typename?: "UsersPermissionsUserEntityResponseCollection";
	data: Array<UsersPermissionsUserEntity>;
	meta: ResponseCollectionMeta;
};

export type UsersPermissionsUserFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
	blocked?: InputMaybe<BooleanFilterInput>;
	confirmationToken?: InputMaybe<StringFilterInput>;
	confirmed?: InputMaybe<BooleanFilterInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	email?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<UsersPermissionsUserFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
	password?: InputMaybe<StringFilterInput>;
	provider?: InputMaybe<StringFilterInput>;
	resetPasswordToken?: InputMaybe<StringFilterInput>;
	role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
	username?: InputMaybe<StringFilterInput>;
};

export type UsersPermissionsUserInput = {
	blocked?: InputMaybe<Scalars["Boolean"]>;
	confirmationToken?: InputMaybe<Scalars["String"]>;
	confirmed?: InputMaybe<Scalars["Boolean"]>;
	email?: InputMaybe<Scalars["String"]>;
	password?: InputMaybe<Scalars["String"]>;
	provider?: InputMaybe<Scalars["String"]>;
	resetPasswordToken?: InputMaybe<Scalars["String"]>;
	role?: InputMaybe<Scalars["ID"]>;
	username?: InputMaybe<Scalars["String"]>;
};

export type UsersPermissionsUserRelationResponseCollection = {
	__typename?: "UsersPermissionsUserRelationResponseCollection";
	data: Array<UsersPermissionsUserEntity>;
};

export type AuthorsQueryVariables = Exact<{ [key: string]: never }>;

export type AuthorsQuery = {
	__typename?: "Query";
	authors?: {
		__typename?: "AuthorEntityResponseCollection";
		data: Array<{
			__typename?: "AuthorEntity";
			attributes?: {
				__typename?: "Author";
				slug: string;
				name: string;
				image?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: { __typename?: "UploadFile"; url: string } | null;
					} | null;
				} | null;
			} | null;
		}>;
	} | null;
};

export type AuthorBySlugQueryVariables = Exact<{
	slug?: InputMaybe<Scalars["String"]>;
}>;

export type AuthorBySlugQuery = {
	__typename?: "Query";
	authors?: {
		__typename?: "AuthorEntityResponseCollection";
		data: Array<{
			__typename?: "AuthorEntity";
			attributes?: {
				__typename?: "Author";
				slug: string;
				name: string;
				image?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: {
							__typename?: "UploadFile";
							url: string;
							alternativeText?: string | null;
						} | null;
					} | null;
				} | null;
				nanomodules?: {
					__typename?: "NanomoduleRelationResponseCollection";
					data: Array<{
						__typename?: "NanomoduleEntity";
						attributes?: {
							__typename?: "Nanomodule";
							slug: string;
							title: string;
							subtitle?: string | null;
							createdAt?: any | null;
							updatedAt?: any | null;
							image?: {
								__typename?: "UploadFileEntityResponse";
								data?: {
									__typename?: "UploadFileEntity";
									attributes?: {
										__typename?: "UploadFile";
										url: string;
										alternativeText?: string | null;
									} | null;
								} | null;
							} | null;
						} | null;
					}>;
				} | null;
			} | null;
		}>;
	} | null;
};

export type CourseBySlugQueryVariables = Exact<{
	slug: Scalars["String"];
}>;

export type CourseBySlugQuery = {
	__typename?: "Query";
	courses?: {
		__typename?: "CourseEntityResponseCollection";
		data: Array<{
			__typename?: "CourseEntity";
			id?: string | null;
			attributes?: {
				__typename?: "Course";
				title: string;
				slug: string;
				subtitle?: string | null;
				description?: string | null;
				createdAt?: any | null;
				updatedAt?: any | null;
				image?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: {
							__typename?: "UploadFile";
							url: string;
							alternativeText?: string | null;
						} | null;
					} | null;
				} | null;
				authors?: {
					__typename?: "AuthorRelationResponseCollection";
					data: Array<{
						__typename?: "AuthorEntity";
						attributes?: {
							__typename?: "Author";
							slug: string;
							name: string;
							image?: {
								__typename?: "UploadFileEntityResponse";
								data?: {
									__typename?: "UploadFileEntity";
									attributes?: {
										__typename?: "UploadFile";
										url: string;
										alternativeText?: string | null;
									} | null;
								} | null;
							} | null;
						} | null;
					}>;
				} | null;
				content?: Array<
					| {
							__typename: "ComponentNanomoduleChapter";
							title: string;
							lessons?: {
								__typename?: "NanomoduleRelationResponseCollection";
								data: Array<{
									__typename?: "NanomoduleEntity";
									attributes?: {
										__typename?: "Nanomodule";
										slug: string;
										title: string;
									} | null;
								}>;
							} | null;
							courses?: {
								__typename?: "CourseRelationResponseCollection";
								data: Array<{
									__typename?: "CourseEntity";
									attributes?: {
										__typename?: "Course";
										title: string;
										slug: string;
									} | null;
								}>;
							} | null;
					  }
					| {
							__typename: "ComponentNanomoduleNanomoduleRelation";
							nanomodule?: {
								__typename?: "NanomoduleEntityResponse";
								data?: {
									__typename?: "NanomoduleEntity";
									attributes?: {
										__typename?: "Nanomodule";
										slug: string;
										title: string;
									} | null;
								} | null;
							} | null;
					  }
					| { __typename: "Error" }
					| null
				> | null;
			} | null;
		}>;
	} | null;
};

export type CoursesWithSlugsQueryVariables = Exact<{
	slugs: Array<InputMaybe<Scalars["String"]>> | InputMaybe<Scalars["String"]>;
}>;

export type CoursesWithSlugsQuery = {
	__typename?: "Query";
	courses?: {
		__typename?: "CourseEntityResponseCollection";
		data: Array<{
			__typename?: "CourseEntity";
			attributes?: {
				__typename?: "Course";
				slug: string;
				title: string;
				subtitle?: string | null;
				image?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: { __typename?: "UploadFile"; url: string } | null;
					} | null;
				} | null;
			} | null;
		}>;
	} | null;
};

export type GetNanomoduleQuestionsBySlugQueryVariables = Exact<{
	slug: Scalars["String"];
}>;

export type GetNanomoduleQuestionsBySlugQuery = {
	__typename?: "Query";
	nanomodules?: {
		__typename?: "NanomoduleEntityResponseCollection";
		data: Array<{
			__typename?: "NanomoduleEntity";
			attributes?: {
				__typename?: "Nanomodule";
				slug: string;
				title: string;
				questions?: any | null;
				image?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: {
							__typename?: "UploadFile";
							url: string;
							alternativeText?: string | null;
						} | null;
					} | null;
				} | null;
			} | null;
		}>;
	} | null;
};

export type NanomoduleBySlugQueryVariables = Exact<{
	slug?: InputMaybe<Scalars["String"]>;
}>;

export type NanomoduleBySlugQuery = {
	__typename?: "Query";
	nanomodules?: {
		__typename?: "NanomoduleEntityResponseCollection";
		data: Array<{
			__typename?: "NanomoduleEntity";
			attributes?: {
				__typename?: "Nanomodule";
				slug: string;
				title: string;
				subtitle?: string | null;
				description?: string | null;
				meta?: any | null;
				createdAt?: any | null;
				updatedAt?: any | null;
				image?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: {
							__typename?: "UploadFile";
							url: string;
							alternativeText?: string | null;
						} | null;
					} | null;
				} | null;
				content: Array<
					| { __typename: "ComponentNanomoduleArticle"; richText: string }
					| {
							__typename: "ComponentNanomoduleVideo";
							video: {
								__typename?: "UploadFileEntityResponse";
								data?: {
									__typename?: "UploadFileEntity";
									attributes?: {
										__typename?: "UploadFile";
										url: string;
										mime: string;
									} | null;
								} | null;
							};
					  }
					| { __typename: "ComponentNanomoduleYoutubeVideo"; url?: string | null }
					| { __typename?: "Error" }
					| null
				>;
				authors?: {
					__typename?: "AuthorRelationResponseCollection";
					data: Array<{
						__typename?: "AuthorEntity";
						attributes?: {
							__typename?: "Author";
							slug: string;
							name: string;
							image?: {
								__typename?: "UploadFileEntityResponse";
								data?: {
									__typename?: "UploadFileEntity";
									attributes?: {
										__typename?: "UploadFile";
										previewUrl?: string | null;
										url: string;
										alternativeText?: string | null;
									} | null;
								} | null;
							} | null;
						} | null;
					}>;
				} | null;
			} | null;
		}>;
	} | null;
};

export const AuthorsDocument = gql`
	query authors {
		authors {
			data {
				attributes {
					slug
					name
					image {
						data {
							attributes {
								url
							}
						}
					}
				}
			}
		}
	}
`;
export const AuthorBySlugDocument = gql`
	query authorBySlug($slug: String) {
		authors(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					name
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
					nanomodules {
						data {
							attributes {
								slug
								title
								subtitle
								createdAt
								updatedAt
								image {
									data {
										attributes {
											url
											alternativeText
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;
export const CourseBySlugDocument = gql`
	query courseBySlug($slug: String!) {
		courses(filters: { slug: { eq: $slug } }) {
			data {
				id
				attributes {
					title
					slug
					subtitle
					description
					createdAt
					updatedAt
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
					authors {
						data {
							attributes {
								slug
								name
								image {
									data {
										attributes {
											url
											alternativeText
										}
									}
								}
							}
						}
					}
					content {
						__typename
						... on ComponentNanomoduleChapter {
							__typename
							title
							lessons {
								data {
									attributes {
										slug
										title
									}
								}
							}
							courses {
								data {
									attributes {
										title
										slug
									}
								}
							}
						}
						... on ComponentNanomoduleNanomoduleRelation {
							nanomodule {
								data {
									attributes {
										slug
										title
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;
export const CoursesWithSlugsDocument = gql`
	query coursesWithSlugs($slugs: [String]!) {
		courses(filters: { slug: { in: $slugs } }) {
			data {
				attributes {
					slug
					title
					subtitle
					image {
						data {
							attributes {
								url
							}
						}
					}
				}
			}
		}
	}
`;
export const GetNanomoduleQuestionsBySlugDocument = gql`
	query getNanomoduleQuestionsBySlug($slug: String!) {
		nanomodules(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					questions
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
				}
			}
		}
	}
`;
export const NanomoduleBySlugDocument = gql`
	query nanomoduleBySlug($slug: String) {
		nanomodules(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					subtitle
					description
					meta
					createdAt
					updatedAt
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
					content {
						... on ComponentNanomoduleArticle {
							__typename
							richText
						}
						... on ComponentNanomoduleVideo {
							__typename
							video {
								data {
									attributes {
										url
										mime
									}
								}
							}
						}
						... on ComponentNanomoduleYoutubeVideo {
							__typename
							url
						}
					}
					authors {
						data {
							attributes {
								slug
								name
								image {
									data {
										attributes {
											previewUrl
											url
											alternativeText
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;

export type SdkFunctionWrapper = <T>(
	action: (requestHeaders?: Record<string, string>) => Promise<T>,
	operationName: string,
	operationType?: string
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
	return {
		authors(
			variables?: AuthorsQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<AuthorsQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<AuthorsQuery>(AuthorsDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"authors",
				"query"
			);
		},
		authorBySlug(
			variables?: AuthorBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<AuthorBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<AuthorBySlugQuery>(AuthorBySlugDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"authorBySlug",
				"query"
			);
		},
		courseBySlug(
			variables: CourseBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<CourseBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<CourseBySlugQuery>(CourseBySlugDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"courseBySlug",
				"query"
			);
		},
		coursesWithSlugs(
			variables: CoursesWithSlugsQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<CoursesWithSlugsQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<CoursesWithSlugsQuery>(CoursesWithSlugsDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"coursesWithSlugs",
				"query"
			);
		},
		getNanomoduleQuestionsBySlug(
			variables: GetNanomoduleQuestionsBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<GetNanomoduleQuestionsBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<GetNanomoduleQuestionsBySlugQuery>(
						GetNanomoduleQuestionsBySlugDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders }
					),
				"getNanomoduleQuestionsBySlug",
				"query"
			);
		},
		nanomoduleBySlug(
			variables?: NanomoduleBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<NanomoduleBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<NanomoduleBySlugQuery>(NanomoduleBySlugDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"nanomoduleBySlug",
				"query"
			);
		}
	};
}
export type Sdk = ReturnType<typeof getSdk>;
