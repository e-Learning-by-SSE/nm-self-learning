"use client";

import { ResourceSearchEntry } from "@self-learning/types";
import { ResourceDeleteOption } from "../resource/resource-delete-dialog";

type CourseDeleteProps = Pick<ResourceSearchEntry, "id" | "slug" | "title">;

export function CourseDeleteOption({ id, slug, title }: CourseDeleteProps) {
	return <ResourceDeleteOption kind="course" id={id} slug={slug} title={title} />;
}
