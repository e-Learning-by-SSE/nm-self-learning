import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
type Props = {
	onCourseCreated: (courseId: string, selectors: string[]) => void;
};

export const courseFormSchema = z.object({
	courseId: z.string().optional(),
	title: z.string().min(3, "Titel muss mindestens 3 Zeichen lang sein."),
	slug: z.string().min(3, "Slug muss mindestens 3 Zeichen lang sein."),
	selectors: z.array(z.string()).optional()
});

export type CourseForm = z.infer<typeof courseFormSchema>;

export function CourseBasicInformation({ onCourseCreated }: Props) {
	const form = useForm<CourseForm>({
		resolver: zodResolver(courseFormSchema),
		defaultValues: {
			title: "",
			slug: "",
			courseId: ""
		}
	});

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = form;

	const createCourse = async () => {
		const course = form.getValues();
		const selectors = ["dummy-selector-1", "dummy-selector-2"];
		onCourseCreated("id-of-course--" + course.title, selectors);
	};

	return (
		<form onSubmit={handleSubmit(createCourse)} className="m-2 w-full max-w-xl space-y-4 p-4">
			<button type="submit" className="btn-primary">
				Kurs erstellen
			</button>
			<div>
				<label className="block font-semibold mb-1">Titel</label>
				<input
					{...register("title", { required: "Titel ist erforderlich." })}
					type="text"
					className="textfield"
					placeholder="Der neue Kurs"
				/>
				{errors.title && <p className="text-red-500">{errors.title.message}</p>}
			</div>

			<div>
				<label className="block font-semibold mb-1">Slug</label>
				<input
					{...register("slug", { required: "Slug ist erforderlich." })}
					type="text"
					className="textfield"
					placeholder="slug-des-kurses"
				/>
				{errors.slug && <p className="text-red-500">{errors.slug.message}</p>}
			</div>
		</form>
	);
}
