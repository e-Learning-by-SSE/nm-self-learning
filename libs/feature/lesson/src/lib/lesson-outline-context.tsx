import { LessonContentType } from "@self-learning/types";
import { NavigableContentContext } from "@self-learning/ui/layouts";
import { createContext, useContext } from "react";

export const LessonOutlineContext =
	createContext<NavigableContentContext<LessonContentType> | null>(null);

export const useLessonOutlineContext = () => useContext(LessonOutlineContext);
