import { ExampleDataGenerator } from "./example-data-generator";
jest.mock("superjson", () => ({ superjson: { create: jest.fn() } }));

xdescribe("Example Data", () => {
	it("Lessons", () => {
		console.log(new ExampleDataGenerator().getLessons());
	});

	it("Courses", () => {
		console.log(new ExampleDataGenerator().getCourses());
	});
});
