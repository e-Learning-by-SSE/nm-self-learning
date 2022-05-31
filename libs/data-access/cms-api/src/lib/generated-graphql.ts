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
	LessonContentDynamicZoneInput: any;
	/** The `Upload` scalar type represents a file upload. */
	Upload: any;
};

export type Author = {
	__typename?: "Author";
	aboutMe?: Maybe<Scalars["String"]>;
	courses?: Maybe<CourseRelationResponseCollection>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	image?: Maybe<UploadFileEntityResponse>;
	lessons?: Maybe<LessonRelationResponseCollection>;
	name: Scalars["String"];
	slug: Scalars["String"];
	teams?: Maybe<TeamRelationResponseCollection>;
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type AuthorCoursesArgs = {
	filters?: InputMaybe<CourseFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	publicationState?: InputMaybe<PublicationState>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type AuthorLessonsArgs = {
	filters?: InputMaybe<LessonFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type AuthorTeamsArgs = {
	filters?: InputMaybe<TeamFiltersInput>;
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
	aboutMe?: InputMaybe<StringFilterInput>;
	and?: InputMaybe<Array<InputMaybe<AuthorFiltersInput>>>;
	courses?: InputMaybe<CourseFiltersInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	lessons?: InputMaybe<LessonFiltersInput>;
	name?: InputMaybe<StringFilterInput>;
	not?: InputMaybe<AuthorFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<AuthorFiltersInput>>>;
	slug?: InputMaybe<StringFilterInput>;
	teams?: InputMaybe<TeamFiltersInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type AuthorInput = {
	aboutMe?: InputMaybe<Scalars["String"]>;
	courses?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	image?: InputMaybe<Scalars["ID"]>;
	lessons?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	name?: InputMaybe<Scalars["String"]>;
	slug?: InputMaybe<Scalars["String"]>;
	teams?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
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

export type Competence = {
	__typename?: "Competence";
	competenceId: Scalars["String"];
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	specialities?: Maybe<SpecialityRelationResponseCollection>;
	subjects?: Maybe<SubjectRelationResponseCollection>;
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type CompetenceSpecialitiesArgs = {
	filters?: InputMaybe<SpecialityFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type CompetenceSubjectsArgs = {
	filters?: InputMaybe<SubjectFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type CompetenceEntity = {
	__typename?: "CompetenceEntity";
	attributes?: Maybe<Competence>;
	id?: Maybe<Scalars["ID"]>;
};

export type CompetenceEntityResponse = {
	__typename?: "CompetenceEntityResponse";
	data?: Maybe<CompetenceEntity>;
};

export type CompetenceEntityResponseCollection = {
	__typename?: "CompetenceEntityResponseCollection";
	data: Array<CompetenceEntity>;
	meta: ResponseCollectionMeta;
};

export type CompetenceFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<CompetenceFiltersInput>>>;
	competenceId?: InputMaybe<StringFilterInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<CompetenceFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<CompetenceFiltersInput>>>;
	specialities?: InputMaybe<SpecialityFiltersInput>;
	subjects?: InputMaybe<SubjectFiltersInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type CompetenceInput = {
	competenceId?: InputMaybe<Scalars["String"]>;
	description?: InputMaybe<Scalars["String"]>;
	specialities?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	subjects?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	title?: InputMaybe<Scalars["String"]>;
};

export type ComponentContentArticle = {
	__typename?: "ComponentContentArticle";
	id: Scalars["ID"];
	richText: Scalars["String"];
};

export type ComponentContentVideo = {
	__typename?: "ComponentContentVideo";
	id: Scalars["ID"];
	video: UploadFileEntityResponse;
};

export type ComponentContentYoutubeVideo = {
	__typename?: "ComponentContentYoutubeVideo";
	id: Scalars["ID"];
	url?: Maybe<Scalars["String"]>;
};

export type ComponentTableOfContentsChapter = {
	__typename?: "ComponentTableOfContentsChapter";
	description?: Maybe<Scalars["String"]>;
	id: Scalars["ID"];
	lessons?: Maybe<Array<Maybe<ComponentTableOfContentsLessonRelation>>>;
	title: Scalars["String"];
};

export type ComponentTableOfContentsChapterLessonsArgs = {
	filters?: InputMaybe<ComponentTableOfContentsLessonRelationFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type ComponentTableOfContentsCourseRelation = {
	__typename?: "ComponentTableOfContentsCourseRelation";
	course?: Maybe<CourseEntityResponse>;
	description?: Maybe<Scalars["String"]>;
	id: Scalars["ID"];
	title: Scalars["String"];
};

export type ComponentTableOfContentsLessonRelation = {
	__typename?: "ComponentTableOfContentsLessonRelation";
	id: Scalars["ID"];
	lesson?: Maybe<LessonEntityResponse>;
};

export type ComponentTableOfContentsLessonRelationFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<ComponentTableOfContentsLessonRelationFiltersInput>>>;
	lesson?: InputMaybe<LessonFiltersInput>;
	not?: InputMaybe<ComponentTableOfContentsLessonRelationFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<ComponentTableOfContentsLessonRelationFiltersInput>>>;
};

export type Course = {
	__typename?: "Course";
	authors?: Maybe<AuthorRelationResponseCollection>;
	content?: Maybe<Array<Maybe<CourseContentDynamicZone>>>;
	courseId: Scalars["String"];
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	image?: Maybe<UploadFileEntityResponse>;
	publishedAt?: Maybe<Scalars["DateTime"]>;
	slug: Scalars["String"];
	specialities?: Maybe<SpecialityRelationResponseCollection>;
	subtitle: Scalars["String"];
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type CourseAuthorsArgs = {
	filters?: InputMaybe<AuthorFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type CourseSpecialitiesArgs = {
	filters?: InputMaybe<SpecialityFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type CourseContentDynamicZone =
	| ComponentTableOfContentsChapter
	| ComponentTableOfContentsCourseRelation
	| ComponentTableOfContentsLessonRelation
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
	courseId?: InputMaybe<StringFilterInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<CourseFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<CourseFiltersInput>>>;
	publishedAt?: InputMaybe<DateTimeFilterInput>;
	slug?: InputMaybe<StringFilterInput>;
	specialities?: InputMaybe<SpecialityFiltersInput>;
	subtitle?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type CourseInput = {
	authors?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	content?: InputMaybe<Array<Scalars["CourseContentDynamicZoneInput"]>>;
	courseId?: InputMaybe<Scalars["String"]>;
	description?: InputMaybe<Scalars["String"]>;
	image?: InputMaybe<Scalars["ID"]>;
	publishedAt?: InputMaybe<Scalars["DateTime"]>;
	slug?: InputMaybe<Scalars["String"]>;
	specialities?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
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
	| Competence
	| ComponentContentArticle
	| ComponentContentVideo
	| ComponentContentYoutubeVideo
	| ComponentTableOfContentsChapter
	| ComponentTableOfContentsCourseRelation
	| ComponentTableOfContentsLessonRelation
	| Course
	| I18NLocale
	| Institution
	| Lesson
	| Speciality
	| Subject
	| Team
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

export type Institution = {
	__typename?: "Institution";
	createdAt?: Maybe<Scalars["DateTime"]>;
	slug: Scalars["String"];
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type InstitutionEntity = {
	__typename?: "InstitutionEntity";
	attributes?: Maybe<Institution>;
	id?: Maybe<Scalars["ID"]>;
};

export type InstitutionEntityResponse = {
	__typename?: "InstitutionEntityResponse";
	data?: Maybe<InstitutionEntity>;
};

export type InstitutionEntityResponseCollection = {
	__typename?: "InstitutionEntityResponseCollection";
	data: Array<InstitutionEntity>;
	meta: ResponseCollectionMeta;
};

export type InstitutionFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<InstitutionFiltersInput>>>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<InstitutionFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<InstitutionFiltersInput>>>;
	slug?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type InstitutionInput = {
	slug?: InputMaybe<Scalars["String"]>;
	title?: InputMaybe<Scalars["String"]>;
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

export type Lesson = {
	__typename?: "Lesson";
	authors?: Maybe<AuthorRelationResponseCollection>;
	content?: Maybe<Array<Maybe<LessonContentDynamicZone>>>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	image?: Maybe<UploadFileEntityResponse>;
	lessonId: Scalars["String"];
	slug: Scalars["String"];
	subtitle?: Maybe<Scalars["String"]>;
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type LessonAuthorsArgs = {
	filters?: InputMaybe<AuthorFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type LessonContentDynamicZone =
	| ComponentContentArticle
	| ComponentContentVideo
	| ComponentContentYoutubeVideo
	| Error;

export type LessonEntity = {
	__typename?: "LessonEntity";
	attributes?: Maybe<Lesson>;
	id?: Maybe<Scalars["ID"]>;
};

export type LessonEntityResponse = {
	__typename?: "LessonEntityResponse";
	data?: Maybe<LessonEntity>;
};

export type LessonEntityResponseCollection = {
	__typename?: "LessonEntityResponseCollection";
	data: Array<LessonEntity>;
	meta: ResponseCollectionMeta;
};

export type LessonFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<LessonFiltersInput>>>;
	authors?: InputMaybe<AuthorFiltersInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	lessonId?: InputMaybe<StringFilterInput>;
	not?: InputMaybe<LessonFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<LessonFiltersInput>>>;
	slug?: InputMaybe<StringFilterInput>;
	subtitle?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type LessonInput = {
	authors?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	content?: InputMaybe<Array<Scalars["LessonContentDynamicZoneInput"]>>;
	description?: InputMaybe<Scalars["String"]>;
	image?: InputMaybe<Scalars["ID"]>;
	lessonId?: InputMaybe<Scalars["String"]>;
	slug?: InputMaybe<Scalars["String"]>;
	subtitle?: InputMaybe<Scalars["String"]>;
	title?: InputMaybe<Scalars["String"]>;
};

export type LessonRelationResponseCollection = {
	__typename?: "LessonRelationResponseCollection";
	data: Array<LessonEntity>;
};

export type Mutation = {
	__typename?: "Mutation";
	createAuthor?: Maybe<AuthorEntityResponse>;
	createCompetence?: Maybe<CompetenceEntityResponse>;
	createCourse?: Maybe<CourseEntityResponse>;
	createInstitution?: Maybe<InstitutionEntityResponse>;
	createLesson?: Maybe<LessonEntityResponse>;
	createSpeciality?: Maybe<SpecialityEntityResponse>;
	createSubject?: Maybe<SubjectEntityResponse>;
	createTeam?: Maybe<TeamEntityResponse>;
	createUploadFile?: Maybe<UploadFileEntityResponse>;
	/** Create a new role */
	createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>;
	/** Create a new user */
	createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
	deleteAuthor?: Maybe<AuthorEntityResponse>;
	deleteCompetence?: Maybe<CompetenceEntityResponse>;
	deleteCourse?: Maybe<CourseEntityResponse>;
	deleteInstitution?: Maybe<InstitutionEntityResponse>;
	deleteLesson?: Maybe<LessonEntityResponse>;
	deleteSpeciality?: Maybe<SpecialityEntityResponse>;
	deleteSubject?: Maybe<SubjectEntityResponse>;
	deleteTeam?: Maybe<TeamEntityResponse>;
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
	updateCompetence?: Maybe<CompetenceEntityResponse>;
	updateCourse?: Maybe<CourseEntityResponse>;
	updateFileInfo: UploadFileEntityResponse;
	updateInstitution?: Maybe<InstitutionEntityResponse>;
	updateLesson?: Maybe<LessonEntityResponse>;
	updateSpeciality?: Maybe<SpecialityEntityResponse>;
	updateSubject?: Maybe<SubjectEntityResponse>;
	updateTeam?: Maybe<TeamEntityResponse>;
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

export type MutationCreateCompetenceArgs = {
	data: CompetenceInput;
};

export type MutationCreateCourseArgs = {
	data: CourseInput;
};

export type MutationCreateInstitutionArgs = {
	data: InstitutionInput;
};

export type MutationCreateLessonArgs = {
	data: LessonInput;
};

export type MutationCreateSpecialityArgs = {
	data: SpecialityInput;
};

export type MutationCreateSubjectArgs = {
	data: SubjectInput;
};

export type MutationCreateTeamArgs = {
	data: TeamInput;
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

export type MutationDeleteCompetenceArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteCourseArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteInstitutionArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteLessonArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteSpecialityArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteSubjectArgs = {
	id: Scalars["ID"];
};

export type MutationDeleteTeamArgs = {
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

export type MutationUpdateCompetenceArgs = {
	data: CompetenceInput;
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

export type MutationUpdateInstitutionArgs = {
	data: InstitutionInput;
	id: Scalars["ID"];
};

export type MutationUpdateLessonArgs = {
	data: LessonInput;
	id: Scalars["ID"];
};

export type MutationUpdateSpecialityArgs = {
	data: SpecialityInput;
	id: Scalars["ID"];
};

export type MutationUpdateSubjectArgs = {
	data: SubjectInput;
	id: Scalars["ID"];
};

export type MutationUpdateTeamArgs = {
	data: TeamInput;
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
	competence?: Maybe<CompetenceEntityResponse>;
	competences?: Maybe<CompetenceEntityResponseCollection>;
	course?: Maybe<CourseEntityResponse>;
	courses?: Maybe<CourseEntityResponseCollection>;
	i18NLocale?: Maybe<I18NLocaleEntityResponse>;
	i18NLocales?: Maybe<I18NLocaleEntityResponseCollection>;
	institution?: Maybe<InstitutionEntityResponse>;
	institutions?: Maybe<InstitutionEntityResponseCollection>;
	lesson?: Maybe<LessonEntityResponse>;
	lessons?: Maybe<LessonEntityResponseCollection>;
	me?: Maybe<UsersPermissionsMe>;
	specialities?: Maybe<SpecialityEntityResponseCollection>;
	speciality?: Maybe<SpecialityEntityResponse>;
	subject?: Maybe<SubjectEntityResponse>;
	subjects?: Maybe<SubjectEntityResponseCollection>;
	team?: Maybe<TeamEntityResponse>;
	teams?: Maybe<TeamEntityResponseCollection>;
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

export type QueryCompetenceArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryCompetencesArgs = {
	filters?: InputMaybe<CompetenceFiltersInput>;
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

export type QueryInstitutionArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryInstitutionsArgs = {
	filters?: InputMaybe<InstitutionFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryLessonArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryLessonsArgs = {
	filters?: InputMaybe<LessonFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QuerySpecialitiesArgs = {
	filters?: InputMaybe<SpecialityFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QuerySpecialityArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QuerySubjectArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QuerySubjectsArgs = {
	filters?: InputMaybe<SubjectFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type QueryTeamArgs = {
	id?: InputMaybe<Scalars["ID"]>;
};

export type QueryTeamsArgs = {
	filters?: InputMaybe<TeamFiltersInput>;
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

export type Speciality = {
	__typename?: "Speciality";
	courses?: Maybe<CourseRelationResponseCollection>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	imageBanner?: Maybe<UploadFileEntityResponse>;
	imageCard?: Maybe<UploadFileEntityResponse>;
	slug: Scalars["String"];
	subject?: Maybe<SubjectEntityResponse>;
	subtitle: Scalars["String"];
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type SpecialityCoursesArgs = {
	filters?: InputMaybe<CourseFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	publicationState?: InputMaybe<PublicationState>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type SpecialityEntity = {
	__typename?: "SpecialityEntity";
	attributes?: Maybe<Speciality>;
	id?: Maybe<Scalars["ID"]>;
};

export type SpecialityEntityResponse = {
	__typename?: "SpecialityEntityResponse";
	data?: Maybe<SpecialityEntity>;
};

export type SpecialityEntityResponseCollection = {
	__typename?: "SpecialityEntityResponseCollection";
	data: Array<SpecialityEntity>;
	meta: ResponseCollectionMeta;
};

export type SpecialityFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<SpecialityFiltersInput>>>;
	courses?: InputMaybe<CourseFiltersInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<SpecialityFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<SpecialityFiltersInput>>>;
	slug?: InputMaybe<StringFilterInput>;
	subject?: InputMaybe<SubjectFiltersInput>;
	subtitle?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type SpecialityInput = {
	courses?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	description?: InputMaybe<Scalars["String"]>;
	imageBanner?: InputMaybe<Scalars["ID"]>;
	imageCard?: InputMaybe<Scalars["ID"]>;
	slug?: InputMaybe<Scalars["String"]>;
	subject?: InputMaybe<Scalars["ID"]>;
	subtitle?: InputMaybe<Scalars["String"]>;
	title?: InputMaybe<Scalars["String"]>;
};

export type SpecialityRelationResponseCollection = {
	__typename?: "SpecialityRelationResponseCollection";
	data: Array<SpecialityEntity>;
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

export type Subject = {
	__typename?: "Subject";
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	imageBanner?: Maybe<UploadFileEntityResponse>;
	imageCard?: Maybe<UploadFileEntityResponse>;
	slug: Scalars["String"];
	specialities?: Maybe<SpecialityRelationResponseCollection>;
	subtitle: Scalars["String"];
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type SubjectSpecialitiesArgs = {
	filters?: InputMaybe<SpecialityFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type SubjectEntity = {
	__typename?: "SubjectEntity";
	attributes?: Maybe<Subject>;
	id?: Maybe<Scalars["ID"]>;
};

export type SubjectEntityResponse = {
	__typename?: "SubjectEntityResponse";
	data?: Maybe<SubjectEntity>;
};

export type SubjectEntityResponseCollection = {
	__typename?: "SubjectEntityResponseCollection";
	data: Array<SubjectEntity>;
	meta: ResponseCollectionMeta;
};

export type SubjectFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<SubjectFiltersInput>>>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	not?: InputMaybe<SubjectFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<SubjectFiltersInput>>>;
	slug?: InputMaybe<StringFilterInput>;
	specialities?: InputMaybe<SpecialityFiltersInput>;
	subtitle?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type SubjectInput = {
	description?: InputMaybe<Scalars["String"]>;
	imageBanner?: InputMaybe<Scalars["ID"]>;
	imageCard?: InputMaybe<Scalars["ID"]>;
	slug?: InputMaybe<Scalars["String"]>;
	specialities?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	subtitle?: InputMaybe<Scalars["String"]>;
	title?: InputMaybe<Scalars["String"]>;
};

export type SubjectRelationResponseCollection = {
	__typename?: "SubjectRelationResponseCollection";
	data: Array<SubjectEntity>;
};

export type Team = {
	__typename?: "Team";
	authors?: Maybe<AuthorRelationResponseCollection>;
	createdAt?: Maybe<Scalars["DateTime"]>;
	description?: Maybe<Scalars["String"]>;
	image?: Maybe<UploadFileEntityResponse>;
	institution?: Maybe<InstitutionEntityResponse>;
	slug: Scalars["String"];
	title: Scalars["String"];
	updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type TeamAuthorsArgs = {
	filters?: InputMaybe<AuthorFiltersInput>;
	pagination?: InputMaybe<PaginationArg>;
	sort?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type TeamEntity = {
	__typename?: "TeamEntity";
	attributes?: Maybe<Team>;
	id?: Maybe<Scalars["ID"]>;
};

export type TeamEntityResponse = {
	__typename?: "TeamEntityResponse";
	data?: Maybe<TeamEntity>;
};

export type TeamEntityResponseCollection = {
	__typename?: "TeamEntityResponseCollection";
	data: Array<TeamEntity>;
	meta: ResponseCollectionMeta;
};

export type TeamFiltersInput = {
	and?: InputMaybe<Array<InputMaybe<TeamFiltersInput>>>;
	authors?: InputMaybe<AuthorFiltersInput>;
	createdAt?: InputMaybe<DateTimeFilterInput>;
	description?: InputMaybe<StringFilterInput>;
	id?: InputMaybe<IdFilterInput>;
	institution?: InputMaybe<InstitutionFiltersInput>;
	not?: InputMaybe<TeamFiltersInput>;
	or?: InputMaybe<Array<InputMaybe<TeamFiltersInput>>>;
	slug?: InputMaybe<StringFilterInput>;
	title?: InputMaybe<StringFilterInput>;
	updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type TeamInput = {
	authors?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
	description?: InputMaybe<Scalars["String"]>;
	image?: InputMaybe<Scalars["ID"]>;
	institution?: InputMaybe<Scalars["ID"]>;
	slug?: InputMaybe<Scalars["String"]>;
	title?: InputMaybe<Scalars["String"]>;
};

export type TeamRelationResponseCollection = {
	__typename?: "TeamRelationResponseCollection";
	data: Array<TeamEntity>;
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

export type CreateLessonMutationVariables = Exact<{
	data: LessonInput;
}>;

export type CreateLessonMutation = {
	__typename?: "Mutation";
	createLesson?: {
		__typename?: "LessonEntityResponse";
		data?: {
			__typename?: "LessonEntity";
			attributes?: {
				__typename?: "Lesson";
				lessonId: string;
				slug: string;
				title: string;
			} | null;
		} | null;
	} | null;
};

export type UpdateLessonMutationVariables = Exact<{
	id: Scalars["ID"];
	data: LessonInput;
}>;

export type UpdateLessonMutation = {
	__typename?: "Mutation";
	updateLesson?: {
		__typename?: "LessonEntityResponse";
		data?: {
			__typename?: "LessonEntity";
			attributes?: {
				__typename?: "Lesson";
				lessonId: string;
				slug: string;
				title: string;
			} | null;
		} | null;
	} | null;
};

export type CreateCourseMutationVariables = Exact<{
	data: CourseInput;
}>;

export type CreateCourseMutation = {
	__typename?: "Mutation";
	createCourse?: {
		__typename?: "CourseEntityResponse";
		data?: {
			__typename?: "CourseEntity";
			attributes?: {
				__typename?: "Course";
				courseId: string;
				slug: string;
				title: string;
			} | null;
		} | null;
	} | null;
};

export type CreateCompetenceMutationVariables = Exact<{
	data: CompetenceInput;
}>;

export type CreateCompetenceMutation = {
	__typename?: "Mutation";
	createCompetence?: {
		__typename?: "CompetenceEntityResponse";
		data?: {
			__typename?: "CompetenceEntity";
			attributes?: {
				__typename?: "Competence";
				title: string;
				description?: string | null;
				subjects?: {
					__typename?: "SubjectRelationResponseCollection";
					data: Array<{
						__typename?: "SubjectEntity";
						attributes?: { __typename?: "Subject"; title: string } | null;
					}>;
				} | null;
			} | null;
		} | null;
	} | null;
};

export type DeleteCompetenceMutationVariables = Exact<{
	id: Scalars["ID"];
}>;

export type DeleteCompetenceMutation = {
	__typename?: "Mutation";
	deleteCompetence?: {
		__typename?: "CompetenceEntityResponse";
		data?: {
			__typename?: "CompetenceEntity";
			attributes?: { __typename?: "Competence"; competenceId: string; title: string } | null;
		} | null;
	} | null;
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
				aboutMe?: string | null;
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
				teams?: {
					__typename?: "TeamRelationResponseCollection";
					data: Array<{
						__typename?: "TeamEntity";
						attributes?: {
							__typename?: "Team";
							slug: string;
							title: string;
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
				courses?: {
					__typename?: "CourseRelationResponseCollection";
					data: Array<{
						__typename?: "CourseEntity";
						attributes?: {
							__typename?: "Course";
							slug: string;
							title: string;
							subtitle: string;
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
				lessons?: {
					__typename?: "LessonRelationResponseCollection";
					data: Array<{
						__typename?: "LessonEntity";
						attributes?: {
							__typename?: "Lesson";
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

export type CompetencesQueryVariables = Exact<{ [key: string]: never }>;

export type CompetencesQuery = {
	__typename?: "Query";
	competences?: {
		__typename?: "CompetenceEntityResponseCollection";
		data: Array<{
			__typename?: "CompetenceEntity";
			id?: string | null;
			attributes?: {
				__typename?: "Competence";
				competenceId: string;
				title: string;
				description?: string | null;
				subjects?: {
					__typename?: "SubjectRelationResponseCollection";
					data: Array<{
						__typename?: "SubjectEntity";
						attributes?: { __typename?: "Subject"; slug: string; title: string } | null;
					}>;
				} | null;
				specialities?: {
					__typename?: "SpecialityRelationResponseCollection";
					data: Array<{
						__typename?: "SpecialityEntity";
						attributes?: {
							__typename?: "Speciality";
							slug: string;
							title: string;
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
				subtitle: string;
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
							__typename: "ComponentTableOfContentsChapter";
							title: string;
							description?: string | null;
							lessons?: Array<{
								__typename?: "ComponentTableOfContentsLessonRelation";
								lesson?: {
									__typename?: "LessonEntityResponse";
									data?: {
										__typename?: "LessonEntity";
										attributes?: {
											__typename?: "Lesson";
											lessonId: string;
											slug: string;
											title: string;
										} | null;
									} | null;
								} | null;
							} | null> | null;
					  }
					| {
							__typename: "ComponentTableOfContentsCourseRelation";
							title: string;
							description?: string | null;
							course?: {
								__typename?: "CourseEntityResponse";
								data?: {
									__typename?: "CourseEntity";
									attributes?: {
										__typename?: "Course";
										slug: string;
										title: string;
										subtitle: string;
										image?: {
											__typename?: "UploadFileEntityResponse";
											data?: {
												__typename?: "UploadFileEntity";
												attributes?: {
													__typename?: "UploadFile";
													url: string;
												} | null;
											} | null;
										} | null;
									} | null;
								} | null;
							} | null;
					  }
					| {
							__typename: "ComponentTableOfContentsLessonRelation";
							lesson?: {
								__typename?: "LessonEntityResponse";
								data?: {
									__typename?: "LessonEntity";
									attributes?: {
										__typename?: "Lesson";
										lessonId: string;
										slug: string;
										title: string;
										subtitle?: string | null;
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
				subtitle: string;
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

export type CoursesForSyncQueryVariables = Exact<{ [key: string]: never }>;

export type CoursesForSyncQuery = {
	__typename?: "Query";
	courses?: {
		__typename?: "CourseEntityResponseCollection";
		meta: {
			__typename?: "ResponseCollectionMeta";
			pagination: { __typename?: "Pagination"; total: number };
		};
		data: Array<{
			__typename?: "CourseEntity";
			attributes?: {
				__typename?: "Course";
				courseId: string;
				slug: string;
				title: string;
				subtitle: string;
				image?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: { __typename?: "UploadFile"; url: string } | null;
					} | null;
				} | null;
				content?: Array<
					| {
							__typename: "ComponentTableOfContentsChapter";
							lessons?: Array<{
								__typename?: "ComponentTableOfContentsLessonRelation";
								lesson?: {
									__typename?: "LessonEntityResponse";
									data?: {
										__typename?: "LessonEntity";
										attributes?: {
											__typename?: "Lesson";
											lessonId: string;
										} | null;
									} | null;
								} | null;
							} | null> | null;
					  }
					| { __typename?: "ComponentTableOfContentsCourseRelation" }
					| { __typename?: "ComponentTableOfContentsLessonRelation" }
					| { __typename?: "Error" }
					| null
				> | null;
			} | null;
		}>;
	} | null;
};

export type LessonBySlugQueryVariables = Exact<{
	slug?: InputMaybe<Scalars["String"]>;
}>;

export type LessonBySlugQuery = {
	__typename?: "Query";
	lessons?: {
		__typename?: "LessonEntityResponseCollection";
		data: Array<{
			__typename?: "LessonEntity";
			attributes?: {
				__typename?: "Lesson";
				lessonId: string;
				slug: string;
				title: string;
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
				content?: Array<
					| { __typename: "ComponentContentArticle"; richText: string }
					| {
							__typename: "ComponentContentVideo";
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
					| { __typename: "ComponentContentYoutubeVideo"; url?: string | null }
					| { __typename?: "Error" }
					| null
				> | null;
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
			} | null;
		}>;
	} | null;
};

export type LessonsForSyncQueryVariables = Exact<{ [key: string]: never }>;

export type LessonsForSyncQuery = {
	__typename?: "Query";
	lessons?: {
		__typename?: "LessonEntityResponseCollection";
		meta: {
			__typename?: "ResponseCollectionMeta";
			pagination: { __typename?: "Pagination"; total: number };
		};
		data: Array<{
			__typename?: "LessonEntity";
			attributes?: {
				__typename?: "Lesson";
				lessonId: string;
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

export type SpecializationBySlugQueryVariables = Exact<{
	slug: Scalars["String"];
}>;

export type SpecializationBySlugQuery = {
	__typename?: "Query";
	specialities?: {
		__typename?: "SpecialityEntityResponseCollection";
		data: Array<{
			__typename?: "SpecialityEntity";
			attributes?: {
				__typename?: "Speciality";
				slug: string;
				title: string;
				subtitle: string;
				description?: string | null;
				subject?: {
					__typename?: "SubjectEntityResponse";
					data?: {
						__typename?: "SubjectEntity";
						attributes?: { __typename?: "Subject"; title: string; slug: string } | null;
					} | null;
				} | null;
				imageBanner?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: { __typename?: "UploadFile"; url: string } | null;
					} | null;
				} | null;
				courses?: {
					__typename?: "CourseRelationResponseCollection";
					data: Array<{
						__typename?: "CourseEntity";
						attributes?: {
							__typename?: "Course";
							courseId: string;
							slug: string;
							title: string;
							subtitle: string;
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

export type SubjectsQueryVariables = Exact<{ [key: string]: never }>;

export type SubjectsQuery = {
	__typename?: "Query";
	subjects?: {
		__typename?: "SubjectEntityResponseCollection";
		data: Array<{
			__typename?: "SubjectEntity";
			attributes?: {
				__typename?: "Subject";
				title: string;
				slug: string;
				subtitle: string;
				imageCard?: {
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

export type SubjectBySlugQueryVariables = Exact<{
	slug: Scalars["String"];
}>;

export type SubjectBySlugQuery = {
	__typename?: "Query";
	subjects?: {
		__typename?: "SubjectEntityResponseCollection";
		data: Array<{
			__typename?: "SubjectEntity";
			attributes?: {
				__typename?: "Subject";
				title: string;
				slug: string;
				subtitle: string;
				description?: string | null;
				specialities?: {
					__typename?: "SpecialityRelationResponseCollection";
					data: Array<{
						__typename?: "SpecialityEntity";
						attributes?: {
							__typename?: "Speciality";
							title: string;
							slug: string;
							subtitle: string;
							imageCard?: {
								__typename?: "UploadFileEntityResponse";
								data?: {
									__typename?: "UploadFileEntity";
									attributes?: { __typename?: "UploadFile"; url: string } | null;
								} | null;
							} | null;
						} | null;
					}>;
				} | null;
				imageBanner?: {
					__typename?: "UploadFileEntityResponse";
					data?: {
						__typename?: "UploadFileEntity";
						attributes?: { __typename?: "UploadFile"; url: string } | null;
					} | null;
				} | null;
				imageCard?: {
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

export type TeamBySlugQueryVariables = Exact<{
	slug: Scalars["String"];
}>;

export type TeamBySlugQuery = {
	__typename?: "Query";
	teams?: {
		__typename?: "TeamEntityResponseCollection";
		data: Array<{
			__typename?: "TeamEntity";
			attributes?: {
				__typename?: "Team";
				slug: string;
				title: string;
				description?: string | null;
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
				institution?: {
					__typename?: "InstitutionEntityResponse";
					data?: {
						__typename?: "InstitutionEntity";
						attributes?: {
							__typename?: "Institution";
							title: string;
							slug: string;
						} | null;
					} | null;
				} | null;
			} | null;
		}>;
	} | null;
};

export const CreateLessonDocument = gql`
	mutation createLesson($data: LessonInput!) {
		createLesson(data: $data) {
			data {
				attributes {
					lessonId
					slug
					title
				}
			}
		}
	}
`;
export const UpdateLessonDocument = gql`
	mutation updateLesson($id: ID!, $data: LessonInput!) {
		updateLesson(id: $id, data: $data) {
			data {
				attributes {
					lessonId
					slug
					title
				}
			}
		}
	}
`;
export const CreateCourseDocument = gql`
	mutation createCourse($data: CourseInput!) {
		createCourse(data: $data) {
			data {
				attributes {
					courseId
					slug
					title
				}
			}
		}
	}
`;
export const CreateCompetenceDocument = gql`
	mutation createCompetence($data: CompetenceInput!) {
		createCompetence(data: $data) {
			data {
				attributes {
					title
					description
					subjects {
						data {
							attributes {
								title
							}
						}
					}
				}
			}
		}
	}
`;
export const DeleteCompetenceDocument = gql`
	mutation deleteCompetence($id: ID!) {
		deleteCompetence(id: $id) {
			data {
				attributes {
					competenceId
					title
				}
			}
		}
	}
`;
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
					aboutMe
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
					teams {
						data {
							attributes {
								slug
								title
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
					courses {
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
					lessons {
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
export const CompetencesDocument = gql`
	query competences {
		competences {
			data {
				id
				attributes {
					competenceId
					title
					description
					subjects {
						data {
							attributes {
								slug
								title
							}
						}
					}
					specialities {
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
						... on ComponentTableOfContentsChapter {
							__typename
							title
							description
							lessons {
								lesson {
									data {
										attributes {
											lessonId
											slug
											title
										}
									}
								}
							}
						}
						... on ComponentTableOfContentsCourseRelation {
							title
							description
							course {
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
						... on ComponentTableOfContentsLessonRelation {
							__typename
							lesson {
								data {
									attributes {
										lessonId
										slug
										title
										subtitle
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
export const CoursesForSyncDocument = gql`
	query coursesForSync {
		courses(pagination: { limit: -1 }) {
			meta {
				pagination {
					total
				}
			}
			data {
				attributes {
					courseId
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
					content {
						... on ComponentTableOfContentsChapter {
							__typename
							lessons {
								lesson {
									data {
										attributes {
											lessonId
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
export const LessonBySlugDocument = gql`
	query lessonBySlug($slug: String) {
		lessons(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					lessonId
					slug
					title
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
					content {
						... on ComponentContentArticle {
							__typename
							richText
						}
						... on ComponentContentVideo {
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
						... on ComponentContentYoutubeVideo {
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
export const LessonsForSyncDocument = gql`
	query lessonsForSync {
		lessons(pagination: { limit: -1 }) {
			meta {
				pagination {
					total
				}
			}
			data {
				attributes {
					lessonId
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
export const SpecializationBySlugDocument = gql`
	query specializationBySlug($slug: String!) {
		specialities(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					subtitle
					description
					subject {
						data {
							attributes {
								title
								slug
							}
						}
					}
					imageBanner {
						data {
							attributes {
								url
							}
						}
					}
					courses {
						data {
							attributes {
								courseId
								slug
								title
								subtitle
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
export const SubjectsDocument = gql`
	query subjects {
		subjects {
			data {
				attributes {
					title
					slug
					subtitle
					imageCard {
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
export const SubjectBySlugDocument = gql`
	query subjectBySlug($slug: String!) {
		subjects(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					title
					slug
					subtitle
					description
					specialities {
						data {
							attributes {
								title
								slug
								subtitle
								imageCard {
									data {
										attributes {
											url
										}
									}
								}
							}
						}
					}
					imageBanner {
						data {
							attributes {
								url
							}
						}
					}
					imageCard {
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
export const TeamBySlugDocument = gql`
	query teamBySlug($slug: String!) {
		teams(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					description
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
					institution {
						data {
							attributes {
								title
								slug
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
		createLesson(
			variables: CreateLessonMutationVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<CreateLessonMutation> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<CreateLessonMutation>(CreateLessonDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"createLesson",
				"mutation"
			);
		},
		updateLesson(
			variables: UpdateLessonMutationVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<UpdateLessonMutation> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<UpdateLessonMutation>(UpdateLessonDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"updateLesson",
				"mutation"
			);
		},
		createCourse(
			variables: CreateCourseMutationVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<CreateCourseMutation> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<CreateCourseMutation>(CreateCourseDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"createCourse",
				"mutation"
			);
		},
		createCompetence(
			variables: CreateCompetenceMutationVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<CreateCompetenceMutation> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<CreateCompetenceMutation>(CreateCompetenceDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"createCompetence",
				"mutation"
			);
		},
		deleteCompetence(
			variables: DeleteCompetenceMutationVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<DeleteCompetenceMutation> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<DeleteCompetenceMutation>(DeleteCompetenceDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"deleteCompetence",
				"mutation"
			);
		},
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
		competences(
			variables?: CompetencesQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<CompetencesQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<CompetencesQuery>(CompetencesDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"competences",
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
		coursesForSync(
			variables?: CoursesForSyncQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<CoursesForSyncQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<CoursesForSyncQuery>(CoursesForSyncDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"coursesForSync",
				"query"
			);
		},
		lessonBySlug(
			variables?: LessonBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<LessonBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<LessonBySlugQuery>(LessonBySlugDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"lessonBySlug",
				"query"
			);
		},
		lessonsForSync(
			variables?: LessonsForSyncQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<LessonsForSyncQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<LessonsForSyncQuery>(LessonsForSyncDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"lessonsForSync",
				"query"
			);
		},
		specializationBySlug(
			variables: SpecializationBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<SpecializationBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<SpecializationBySlugQuery>(
						SpecializationBySlugDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders }
					),
				"specializationBySlug",
				"query"
			);
		},
		subjects(
			variables?: SubjectsQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<SubjectsQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<SubjectsQuery>(SubjectsDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"subjects",
				"query"
			);
		},
		subjectBySlug(
			variables: SubjectBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<SubjectBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<SubjectBySlugQuery>(SubjectBySlugDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"subjectBySlug",
				"query"
			);
		},
		teamBySlug(
			variables: TeamBySlugQueryVariables,
			requestHeaders?: Dom.RequestInit["headers"]
		): Promise<TeamBySlugQuery> {
			return withWrapper(
				wrappedRequestHeaders =>
					client.request<TeamBySlugQuery>(TeamBySlugDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders
					}),
				"teamBySlug",
				"query"
			);
		}
	};
}
export type Sdk = ReturnType<typeof getSdk>;
