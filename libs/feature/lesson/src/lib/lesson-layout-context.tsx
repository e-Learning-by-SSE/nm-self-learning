// LessonLayoutContext.tsx
import { createContext, useContext } from "react";

export type LessonLayoutContextType = {
	playlistRef?: React.RefObject<HTMLDivElement>;
};

export const LessonLayoutContext = createContext<LessonLayoutContextType>({});

export const useLessonLayout = () => useContext(LessonLayoutContext);
