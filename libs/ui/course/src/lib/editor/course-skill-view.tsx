import { CourseFormModel } from "@self-learning/teaching";
import { useFormContext } from "react-hook-form";

export function CourseSkillView() {
	const form = useFormContext<CourseFormModel & { content: unknown[] }>();
	const {
		register,
		control,
		formState: { errors },
		getValues
	} = form;

	console.log("Form", getValues());
	return <>course skill view</>;
}
