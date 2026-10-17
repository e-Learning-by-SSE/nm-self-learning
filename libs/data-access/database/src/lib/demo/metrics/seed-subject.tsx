import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createSubjects() {
	try {
		await prisma.subject.create({
			data: {
				subjectId: "wizardry",
				slug: "wizardry",
				title: "Wizardry",
				subtitle: "Fundamentals of Magical Arts and Spellcasting",
				imgUrlBanner:
					"https://images.stockcake.com/public/c/f/6/cf6c946e-61f0-4c74-8ec5-8367a4bd50b3_large/magical-floating-hat-stockcake.jpg",
				cardImgUrl:
					"https://images.stockcake.com/public/c/f/6/cf6c946e-61f0-4c74-8ec5-8367a4bd50b3_large/magical-floating-hat-stockcake.jpg"
			}
		});
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Subjects");
	} catch (error) {
		console.error("Error creating subjects:", error);
	} finally {
		await prisma.$disconnect();
	}
}
