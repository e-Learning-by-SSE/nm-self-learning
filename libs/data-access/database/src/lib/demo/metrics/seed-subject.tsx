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
					"https://c.pxhere.com/photos/1c/6b/magic_wizard_hat_wand_spellbook_potions_alchemy_mystic_fantasy-1582034.jpg!d",
				cardImgUrl:
					"https://c.pxhere.com/photos/1c/6b/magic_wizard_hat_wand_spellbook_potions_alchemy_mystic_fantasy-1582034.jpg!d"
			}
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Subjects");
	} catch (error) {
		console.error("Error creating subjects:", error);
	} finally {
		await prisma.$disconnect();
	}
}
