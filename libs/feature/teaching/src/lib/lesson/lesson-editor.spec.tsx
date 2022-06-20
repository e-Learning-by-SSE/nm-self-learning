import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { LessonInfoEditor } from "./forms/lesson-info";
import { LessonFormModel } from "./lesson-editor";

describe("Lesson Editor", () => {
	it("LessonInfoEditor", async () => {
		let result: unknown | null = null;

		const onSubmit = jest.fn().mockImplementation(data => {
			result = data;
		});

		function Wrapper({ children }: { children: React.ReactNode }) {
			const methods = useForm<LessonFormModel>({
				defaultValues: {
					lessonId: "",
					title: "",
					slug: "",
					subtitle: "",
					description: "",
					imgUrl: "",
					content: [],
					quiz: []
				}
			});

			return (
				<div>
					<FormProvider {...methods}>
						<form
							onSubmit={methods.handleSubmit(data => {
								onSubmit(data);
							})}
						>
							<button type="submit">Submit</button>
							{children}
						</form>
					</FormProvider>
				</div>
			);
		}

		const { container } = render(<LessonInfoEditor />, { wrapper: Wrapper });

		const title = getInputByName("title", container);
		const slug = getInputByName("slug", container);
		const subtitle = getTextareaByName("subtitle", container);

		expect(title).toBeTruthy();
		expect(slug).toBeTruthy();
		expect(subtitle).toBeTruthy();

		fireEvent.change(title, { target: { value: "The Title" } });
		fireEvent.change(slug, { target: { value: "the-title" } });
		fireEvent.change(subtitle, { target: { value: "This is the subtitle." } });

		expect(title.value).toEqual("The Title");

		fireEvent.click(screen.getByText("Submit"));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalled();
			expect(result).toMatchInlineSnapshot(`
			Object {
			  "content": Array [],
			  "description": "",
			  "imgUrl": "",
			  "lessonId": "",
			  "quiz": Array [],
			  "slug": "the-title",
			  "subtitle": "This is the subtitle.",
			  "title": "The Title",
			}
		`);
		});
	});
});

function getInputByName(
	name: string,
	container: { querySelector: (selector: string) => HTMLElement | null }
) {
	return container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
}

function getTextareaByName(
	name: string,
	container: { querySelector: (selector: string) => HTMLElement | null }
) {
	return container.querySelector(`textarea[name="${name}"]`) as HTMLInputElement;
}
