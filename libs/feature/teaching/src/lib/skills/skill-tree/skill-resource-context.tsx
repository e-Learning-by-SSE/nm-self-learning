import React, { createContext } from "react";

// usage overlay from parent (form / getSkillContext)
type SkillResourceContextType = {
	lessonRequired: Set<string>;
	lessonProvided: Set<string>;
	courseRequired: Set<string>;
	courseProvided: Set<string>;
	current: Set<string>;
};
export const SkillResourceContext = createContext<SkillResourceContextType | undefined>(undefined);

export const SkillResourceProvider = ({
	children,
	...props
}: SkillResourceContextType & { children: React.ReactNode }) => {
	return <SkillResourceContext.Provider value={props}>{children}</SkillResourceContext.Provider>;
};
