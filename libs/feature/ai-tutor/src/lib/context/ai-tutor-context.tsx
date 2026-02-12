import React, { createContext } from "react";
import { useAiTutor } from "../hooks/use-ai-tutor";

type AiTutorContextType = ReturnType<typeof useAiTutor>;

const AiTutorContext = createContext<AiTutorContextType | null>(null);

export const AiTutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const aiTutor = useAiTutor();
	return <AiTutorContext.Provider value={aiTutor}>{children}</AiTutorContext.Provider>;
};
