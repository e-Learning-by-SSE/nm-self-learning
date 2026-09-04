import React, { createContext } from "react";

// usage overlay from parent (form / getSkillContext)
type SkillResourceContextType = {
	requiredIds: Set<string>;
	providedIds: Set<string>;
	currentIds: Set<string>;
	topIds: Set<string>;
};
export const SkillResourceContext = createContext<SkillResourceContextType | undefined>(undefined);

export const SkillResourceProvider = ({
	children,
	...props
}: SkillResourceContextType & { children: React.ReactNode }) => {
	return <SkillResourceContext.Provider value={props}>{children}</SkillResourceContext.Provider>;
};
