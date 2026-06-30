"use client";

import { ResourceSearchEntry } from "@self-learning/types";
import { ResourceDeleteOption } from "../resource/resource-delete-dialog";

type LessonDeleteProps = Pick<ResourceSearchEntry, "id" | "slug" | "title">;

export function LessonDeleteOption({ id, slug, title }: LessonDeleteProps) {
	return <ResourceDeleteOption kind="lesson" id={id} slug={slug} title={title} />;
}
