import { CourseFormModel, createEmptyCourseFormModel } from "@self-learning/teaching";
import { createContext, ReactNode, useState } from "react";

export interface CourseDataContextType {
	data: { course: CourseFormModel };
	setData: React.Dispatch<React.SetStateAction<{ course: CourseFormModel }>>;
}

export const CourseDataContext = createContext<CourseDataContextType | undefined>(undefined);

export const CourseDataProvider = ({ children }: { children: ReactNode }) => {
	const [data, setData] = useState({ course: createEmptyCourseFormModel() });

	return (
		<CourseDataContext.Provider value={{ data, setData }}>
			{children}
		</CourseDataContext.Provider>
	);
};
