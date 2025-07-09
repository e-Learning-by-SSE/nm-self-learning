import { createContext, useContext } from "react";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { SkillFormModel } from "@self-learning/types";
import React from "react";

type ModuleViewContextType = {
	modules: Map<string, LessonFormModel>;
	setModules: (modules: Map<string, LessonFormModel>) => void;
	selectedModuleId: string | null;
	setSelectedModuleId: (id: string | null) => void;
	allSkills: Map<string, SkillFormModel>;
};
const ModuleViewContext = createContext<ModuleViewContextType | undefined>(undefined);

type ModuleViewProviderProps = {
	children: React.ReactNode;
    modules: Map<string, LessonFormModel>;
    setModules: (modules: Map<string, LessonFormModel>) => void;
    selectedModuleId: string | null;
    setSelectedModuleId: (id: string | null) => void;
    allSkills: Map<string, SkillFormModel>;
};

export const ModuleViewProvider = ({
	children,
    modules,
    setModules,
    selectedModuleId,
    setSelectedModuleId,
    allSkills
}: ModuleViewProviderProps) => {

	return (
		<ModuleViewContext.Provider
			value={{
				modules,
				setModules,
				selectedModuleId: selectedModuleId,
				setSelectedModuleId,
				allSkills,
			}}
		>
			{children}
		</ModuleViewContext.Provider>
	);
};

export const useModuleViewContext = () => {
	const ctx = useContext(ModuleViewContext);
	if (!ctx) throw new Error("useModuleContext must be used within ModuleProvider");
    console.error("useModuleViewContext must be used within ModuleViewProvider");
    console.trace();
	return ctx;
};
