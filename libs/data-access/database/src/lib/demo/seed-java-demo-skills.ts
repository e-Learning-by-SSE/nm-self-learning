import { createSkillGroups, createSkills } from "../seed-functions";

const skills = [
	{
		id: "1",
		name: "Compiler Calling",
		description: "Calling javac, wo/ knowing what it exactly does"
	},
	{
		id: "2",
		name: "Interpreter Calling",
		description: "Calling java, wo/ knowing what it exactly does"
	},
	{
		id: "3",
		name: "Compiler Usage",
		description: "Knowing how & why to use javac"
	},
	{
		id: "4",
		name: "Interpreter Usage",
		description: "Knowing how & why to use java"
	},
	{
		id: "5",
		name: "Literals",
		description: "Constant expressions"
	},
	{
		id: "6",
		name: "Primitive Datatypes & Operators",
		description: ""
	},
	{
		id: "7",
		name: "Variables",
		description: "Variable Usage in Expressions"
	},
	{
		id: "9",
		name: "if-statement",
		description: "if wo/ else"
	},
	{
		id: "10",
		name: "else-statement",
		description: "else-statement"
	},
	{
		id: "11",
		name: "if-block",
		description: "Using curly brackets to nest more than 1 statement"
	},
	{
		id: "12",
		name: "if nesting",
		description: "Nest multiple if-statements"
	},
	{
		id: "13",
		name: "switch/case basics",
		description: "switch, case, break, default"
	},
	{
		id: "14",
		name: "switch/case advanced",
		description: "falls through, expressions, strings"
	},
	{
		id: "15",
		name: "Program Structure I",
		description: "Knowing how to add own code into a template"
	},
	{
		id: "16",
		name: "Program Structure II",
		description: "Knowing how to add own code into a template"
	},
	{
		id: "17",
		name: "Casting Primitive Datatypes",
		description: ""
	},
	{
		id: "18",
		name: "What are Expressions",
		description: ""
	},
	{
		id: "19",
		name: "Constants",
		description: "final, static"
	},
	{
		id: "20",
		name: "Input",
		description: "User input via Scanner"
	},
	{
		id: "21",
		name: "Writing Import",
		description: "Writing Import statements wo/ knowing the background"
	},
	{
		id: "22",
		name: "Math.random",
		description: "Using Math.random"
	},
	{
		id: "23",
		name: "Code Block I",
		description: "More than one statement wo/scope"
	},
	{
		id: "24",
		name: "Code Block II",
		description: "With scope"
	},
	{
		id: "25",
		name: "Foundations of Loops",
		description: "Explains general use of Loops"
	},
	{ id: "26", name: "For-Loop", description: "For-Loop" },
	{
		id: "27",
		name: "While-Loop",
		description: "While-Loop"
	},
	{
		id: "28",
		name: "Do-While-Loop",
		description: "Do-While-Loop"
	}
];

const skillGroups = [
	{
		id: "1001",
		name: "Commands Usage",
		description: "Commands to compile and execute own programs, wo/ deeper understanding",
		children: ["1", "2"]
	},
	{
		id: "1002",
		name: "Commands Understanding",
		description: "Commands to compile and execute own programs, wo/ deeper understanding",
		children: ["3", "4"]
	},
	{
		id: "1003",
		name: "Expressions",
		description: "Complete understanding of expressions in Java",
		children: ["5", "6", "7", "18"]
	},
	{
		id: "1004",
		name: "if/else concept",
		description: "Complete understanding of if/else in Java",
		children: ["9", "10", "11", "12", "1003"]
	},
	{
		id: "1005",
		name: "switch/case concept",
		description: "Complete understanding of switch/case in Java",
		children: ["13", "14", "23", "1003"]
	},
	{
		id: "1006",
		name: "Branching",
		description: "if/else and switch/case",
		children: ["1004", "1005"]
	},
	{
		id: "1007",
		name: "Code Blocks",
		description: "",
		children: ["11", "23", "24"]
	},
	{
		id: "1008",
		name: "Imperative Loops",
		description: "",
		children: ["25", "26", "27", "28"]
	},
	{
		id: "1009",
		name: "Control Structures",
		description: "if, switch case, loops",
		children: ["1006", "1008"]
	}
];

const repository = {
	id: "1",
	name: "Java OO Repository",
	description: "Example to demonstrate competence modelling capabilities"
};

export async function seedJavaDemoSkills() {

	await createSkills(skills, repository.id);
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Skills");

	await createSkillGroups(skillGroups, repository);
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Skill Groups");
}
