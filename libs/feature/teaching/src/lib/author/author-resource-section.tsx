"use client";
import { ArrowDownTrayIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { greaterOrEqAccessLevel, ResourceKind, ResourceSearchEntry } from "@self-learning/types";
import {
	IconTextButton,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { VoidSvg } from "@self-learning/ui/static";
import { keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { CourseExportType, ExportCourseDialog } from "../course/course-export/course-export-dialog";
import { CourseDeleteOption } from "./course-delete-option";
import { LessonDeleteOption } from "./lesson-delete-option";

type AuthorResourceLinks = {
	viewHref: string;
	editHref?: string;
	createHref?: string;
};

function getResourceCreateLinks(kind: ResourceKind) {
	switch (kind) {
		case "course":
			return "/teaching/courses/create";
		case "lesson":
			return "/teaching/lessons/create";
		default:
			return undefined;
	}
}

function getAuthorResourceLinks(resource: ResourceSearchEntry): AuthorResourceLinks {
	switch (resource.kind) {
		case "course":
			return {
				viewHref: `/courses/${resource.slug}`,
				editHref: `/teaching/courses/edit/${resource.id}`,
				createHref: "/teaching/courses/create"
			};
		case "lesson":
			return {
				viewHref: `/lessons/${resource.slug}`,
				editHref: `/teaching/lessons/edit/${resource.id}`,
				createHref: "/teaching/lessons/create"
			};
		case "subject":
			return {
				viewHref: `/teaching/subjects/${resource.id}`,
				editHref: `/teaching/subjects/${resource.id}/edit`
			};
		case "specialization":
			if (!resource.parentId) {
				console.log("warning: specialization without a subject id");
				return { viewHref: "/subjects" };
			}
			return {
				viewHref: `/teaching/subjects/${resource.parentId}/${resource.id}`,
				editHref: `/teaching/subjects/${resource.parentId}/${resource.id}/edit`
			};
	}
}

export function AuthorResourceSection({
	kind,
	title,
	subtitle,
	searchPlaceholder,
	emptyMessage,
	createLabel,
	isAdmin,
	canCreate = false
}: {
	kind: ResourceKind;
	title: string;
	subtitle: string;
	searchPlaceholder: string;
	emptyMessage: string;
	createLabel?: string;
	isAdmin: boolean;
	canCreate?: boolean;
}) {
	const [filterTitle, setFilterTitle] = useState("");
	const [page, setPage] = useState(1);
	const [exportCourse, setExportCourse] = useState<CourseExportType | null>(null);

	const { data: resources } = trpc.permission.getMyResources.useQuery(
		{ title: filterTitle, page, kinds: [kind] },
		{ staleTime: 10_000, placeholderData: keepPreviousData }
	);

	const showEmpty = resources?.result.length === 0 && filterTitle === "";

	const createHref = getResourceCreateLinks(kind);

	return (
		<section>
			<div className="flex justify-between gap-4">
				<SectionHeader title={title} subtitle={subtitle} />
				{createLabel && createHref && canCreate && (
					<Link href={createHref} className="mt-4">
						<IconTextButton
							className="btn-secondary"
							text={createLabel}
							icon={<PlusIcon className="icon h-5" />}
						/>
					</Link>
				)}
			</div>

			<SearchField
				placeholder={searchPlaceholder}
				onChange={event => {
					setFilterTitle(event.target.value);
					setPage(1);
				}}
			/>

			<ul className="flex flex-col gap-1 py-4">
				{!resources && <LoadingBox />}
				{showEmpty ? (
					<div className="mx-auto flex items-center gap-8">
						<div className="h-32 w-32">
							<VoidSvg />
						</div>
						<p className="text-c-text-muted">{emptyMessage}</p>
					</div>
				) : (
					resources?.result.map(resource => (
						<AuthorResourceRow
							key={resource.key}
							resource={resource}
							isAdmin={isAdmin}
							onExport={
								resource.kind === "course"
									? () =>
											setExportCourse({
												courseId: resource.id,
												slug: resource.slug,
												title: resource.title,
												imgUrl: resource.imgUrl ?? null
											})
									: undefined
							}
						/>
					))
				)}
			</ul>

			{resources?.result && (
				<Paginator pagination={resources} url="ignored" onPageChange={setPage} />
			)}

			{exportCourse && (
				<ExportCourseDialog course={exportCourse} onClose={() => setExportCourse(null)} />
			)}
		</section>
	);
}

function AuthorResourceRow({
	resource,
	isAdmin,
	onExport
}: {
	resource: ResourceSearchEntry;
	isAdmin: boolean;
	onExport?: () => void;
}) {
	const { t } = useTranslation("feature-teaching");
	const accessLevel = resource.accessLevel ?? AccessLevel.VIEW;
	const links = getAuthorResourceLinks(resource);
	const canEdit = isAdmin || greaterOrEqAccessLevel(accessLevel, AccessLevel.EDIT);
	const canManage = isAdmin || greaterOrEqAccessLevel(accessLevel, AccessLevel.FULL);

	return (
		<li className="flex items-center rounded-lg border border-c-border bg-white">
			<ImageOrPlaceholder
				src={resource.imgUrl ?? undefined}
				className="h-16 w-16 rounded-l-lg object-cover"
			/>
			<div className="flex w-full items-center justify-between px-4">
				<Link href={links.viewHref} className="text-sm font-medium hover:text-c-primary">
					{resource.title}
				</Link>
				<div className="flex flex-wrap justify-end gap-4">
					<i className="flex items-center">{accessLevel}</i>
					{canEdit && links.editHref && (
						<Link href={links.editHref}>
							<IconTextButton
								icon={<PencilIcon className="h-5 w-5" />}
								text={t("Edit")}
								className="btn-stroked"
								title={editTitle(resource.kind, t)}
							/>
						</Link>
					)}
					{canManage && resource.kind === "course" && onExport && (
						<>
							<IconTextButton
								icon={<ArrowDownTrayIcon className="h-5 w-5" />}
								text={t("Export")}
								className="btn-stroked"
								title={t("Export_Course")}
								onClick={onExport}
							/>
							<CourseDeleteOption
								id={resource.id}
								slug={resource.slug}
								title={resource.title}
							/>
						</>
					)}
					{canManage && resource.kind === "lesson" && (
						<LessonDeleteOption
							id={resource.id}
							slug={resource.slug}
							title={resource.title}
						/>
					)}
				</div>
			</div>
		</li>
	);
}

function editTitle(kind: ResourceKind, t: (key: string) => string): string {
	switch (kind) {
		case "course":
			return t("Edit_Course");
		case "lesson":
			return t("Edit_Lesson");
		case "subject":
			return t("Edit_Subject");
		case "specialization":
			return t("Edit_Specialization");
	}
}
