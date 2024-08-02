import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { slugify } from "@self-learning/util/common";

type Lesson = Pick<
	Prisma.LessonCreateInput,
	"lessonId" | "slug" | "title" | "subtitle" | "imgUrl"
> & {
	description: string;
};

type Course = Pick<
	Prisma.CourseCreateInput,
	"courseId" | "title" | "subtitle" | "slug" | "imgUrl"
> & {
	description: string;
};

export class ExampleDataGenerator {
	constructor() {
		faker.seed(123);
	}

	getStudents() {
		return [
			{
				displayName: "Harry Potter",
				username: "potter"
			},
			{
				displayName: "Ronald Weasley",
				username: "weasley"
			}
		];
	}

	getLessons(): Lesson[] {
		return [
			"A Beginners Guide to React Introduction",
			"Create a User Interface with Vanilla JavaScript and DOM",
			"Create a User Interface with React’s createElement API",
			"Create a User Interface with React’s JSX syntax",
			"Use JSX effectively with React",
			"Render two elements side-by-side with React Fragments",
			"Create a Simple Reusable React Component",
			"Validate Custom React Component Props with PropTypes",
			"Understand and Use Interpolation in JSX",
			"Rerender a React Application",
			"Style React Components with className and inline Styles",
			"Use Event Handlers with React",
			"Manage state in a React Component with the useState hook",
			"Manage side-effects in a React Component with the useEffect hook",
			"Use a lazy initializer with useState",
			"Manage the useEffect dependency array",
			"Create reusable custom hooks",
			"Manipulate the DOM with React refs",
			"Understand the React Hook Flow",
			"Make Basic Forms with React",
			"Make Dynamic Forms with React",
			"Controlling Form Values with React",
			"Using React Error Boundaries to handle errors in React Components",
			"Use the key prop when Rendering a List with React",
			"Lifting and colocating React State",
			"Make HTTP Requests with React",
			"Handle HTTP Errors with React",
			"Install and use React DevTools",
			"Build and deploy a React Application with Codesandbox, GitHub, and Netlify",
			"A Beginners Guide to React Outro"
		].map(title => ({
			title,
			lessonId: faker.string.alphanumeric(8),
			slug: slugify(title, { lower: true, strict: true }),
			subtitle: faker.lorem.paragraph(1),
			description: faker.lorem.paragraphs(3),
			imgUrl: faker.image.image()
		}));
	}

	getCourses(): Course[] {
		return [
			{
				courseId: faker.string.alphanumeric(8),
				title: "The Beginner's Guide to React",
				slug: "the-beginners-guide-to-react",
				subtitle: faker.lorem.paragraph(2),
				description: faker.lorem.paragraphs(3),
				imgUrl: faker.image.image()
			}
		];
	}
}
