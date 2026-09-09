"use client";

import { ResourceDeleteEntry, ResourceDeleteOption } from "../resource/resource-delete-dialog";

type CourseDeleteProps = Pick<ResourceDeleteEntry, "id" | "slug" | "title" | "permissions">;

export function CourseDeleteOption(props: CourseDeleteProps) {
	return <ResourceDeleteOption kind="course" {...props} />;
}
