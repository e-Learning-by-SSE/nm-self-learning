"use client";

import { ResourceDeleteEntry, ResourceDeleteOption } from "../resource/resource-delete-dialog";

type LessonDeleteProps = Pick<ResourceDeleteEntry, "id" | "slug" | "title" | "permissions">;

export function LessonDeleteOption(props: LessonDeleteProps) {
	return <ResourceDeleteOption kind="lesson" {...props} />;
}
