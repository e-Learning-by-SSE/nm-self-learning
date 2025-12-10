import React, { createContext, useContext } from "react";
import { useAiTutor } from "../hooks/use-ai-tutor";
import { useTranslation } from "next-i18next";

type AiTutorContextType = ReturnType<typeof useAiTutor>;

const AiTutorContext = createContext<AiTutorContextType | null>(null);

export const AiTutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const aiTutor = useAiTutor();
	return <AiTutorContext.Provider value={aiTutor}>{children}</AiTutorContext.Provider>;
};

export const useAiTutorContext = (): AiTutorContextType => {
	const { t } = useTranslation("feature-ai-tutor");
	const ctx = useContext(AiTutorContext);
	if (!ctx) {
		throw new Error(t("Ai Tutor is not available."));
	}
	return ctx;
};
