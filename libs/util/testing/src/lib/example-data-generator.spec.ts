import { ExampleDataGenerator } from "./example-data-generator";

xdescribe("Example Data", () => {
	it("Lessons", () => {
		console.log(new ExampleDataGenerator().getLessons());
	});

	it("Courses", () => {
		console.log(new ExampleDataGenerator().getCourses());
	});
});
