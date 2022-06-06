import { Prisma, PrismaClient } from "@prisma/client";

import { faker } from "@faker-js/faker";
import slugify from "slugify";

const prisma = new PrismaClient();

const students = [
	{
		displayName: "Harry Potter",
		username: "potter"
	},
	{
		displayName: "Ronald Weasley",
		username: "weasley"
	}
];

const users: Prisma.UserCreateInput[] = students.map(student => ({
	name: student.username,
	accounts: {
		create: [
			{
				provider: "demo",
				providerAccountId: `${student.username}`,
				type: "demo-account"
			}
		]
	},
	student: {
		create: student
	}
}));

const subjects: Prisma.SubjectCreateManyInput[] = [
	{
		subjectId: 1,
		slug: "informatik",
		title: "Informatik"
	},
	{
		subjectId: 2,
		slug: "mathematik",
		title: "Mathematik"
	},
	{
		subjectId: 3,
		slug: "psychologie",
		title: "Psychologie"
	}
];

const specialties: Prisma.SpecialtyCreateManyInput[] = [
	{
		specialtyId: 1,
		subjectId: 1,
		slug: "softwareentwicklung",
		title: "Softwareentwicklung"
	}
];

const courses: Prisma.CourseCreateManyInput[] = [
	{
		courseId: faker.random.alphaNumeric(8),
		title: "The Beginner's Guide to React",
		slug: "the-beginners-guide-to-react",
		subtitle: faker.lorem.paragraph(2),
		description: faker.lorem.paragraphs(3),
		imgUrl: faker.image.business(),
		subjectId: 1
	}
];

const lessons: Prisma.LessonCreateManyInput[] = [
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
	lessonId: faker.random.alphaNumeric(8),
	slug: slugify(title, { lower: true, strict: true }),
	subtitle: faker.lorem.paragraph(1),
	description: faker.lorem.paragraphs(3),
	imgUrl: faker.image.business()
}));

const competences: Prisma.CompetenceCreateInput[] = [
	{ competenceId: "competence-1", title: "Competence #1" },
	{ competenceId: "competence-2", title: "Competence #2" },
	{ competenceId: "competence-3", title: "Competence #3" }
];

const enrollments: Prisma.EnrollmentCreateManyInput[] = [
	{
		status: "ACTIVE",
		createdAt: new Date(2022, 4, 20),
		courseId: courses[0].courseId,
		username: students[0].username
	}
];

async function seed(): Promise<void> {
	const start = Date.now();

	console.log("Deleting previous records...");
	await prisma.user.deleteMany();
	await prisma.course.deleteMany();
	await prisma.specialty.deleteMany();
	await prisma.subject.deleteMany();
	await prisma.enrollment.deleteMany();
	await prisma.competence.deleteMany();
	await prisma.lesson.deleteMany();

	console.log("😅 Seeding...");
	await prisma.subject.createMany({ data: subjects });
	console.log("✅ Subjects");
	await prisma.specialty.createMany({ data: specialties });
	console.log("✅ Specialties");
	await prisma.course.createMany({ data: courses });
	console.log("✅ Courses");
	await prisma.lesson.createMany({ data: lessons });
	console.log("✅ Lessons");
	await createUsers();
	console.log("✅ Users");
	await prisma.enrollment.createMany({ data: enrollments });
	console.log("✅ Enrollments");
	await prisma.competence.createMany({ data: competences });
	console.log("✅ Competences");
	await createAchievedCompetences();
	console.log("✅ AchievedCompetences");

	console.log(`\nSeed command took ${Date.now() - start}ms`);
}

seed()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function createUsers(): Promise<void> {
	for (const user of users) {
		await prisma.user.create({
			data: user
		});
	}
}

async function createAchievedCompetences(): Promise<void> {
	const achievedCompetences = [
		{
			username: users[0].student?.create?.username as string,
			competenceId: competences[0].competenceId
		},
		{
			username: students[0].username,
			competenceId: competences[1].competenceId
		}
	];

	const promises = achievedCompetences.map(({ competenceId, username }) =>
		prisma.achievedCompetence.create({
			data: {
				competenceId,
				username,
				lessonSlug: "a-beginners-guide-to-react-introduction",
				achievedAt: new Date(2022, 5, 20)
			}
		})
	);

	await Promise.all(promises);
}
