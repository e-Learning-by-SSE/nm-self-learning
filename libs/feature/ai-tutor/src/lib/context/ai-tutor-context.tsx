import React, { createContext, useContext } from "react";
import { useAiTutor } from "../hooks/use-ai-tutor";

type AiTutorContextType = ReturnType<typeof useAiTutor>;

const AiTutorContext = createContext<AiTutorContextType | null>(null);

export const AiTutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const aiTutor = useAiTutor();
	return <AiTutorContext.Provider value={aiTutor}>{children}</AiTutorContext.Provider>;
};

export const useAiTutorContext = (): AiTutorContextType => {
	const ctx = useContext(AiTutorContext);
	if (!ctx) {
		throw new Error("useAiTutorContext must be used within an AiTutorProvider");
	}
	return ctx;
};
