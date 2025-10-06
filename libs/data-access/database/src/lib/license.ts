import { PrismaClient, Prisma } from "@prisma/client";

export const license: Prisma.LicenseCreateManyInput[] = [
	{
		name: "Uni Hi Intern",
		licenseText:
			"Nur für die interne Verwendung an der Universität Hildesheim (Moodle, Selflernplattform, Handreichungen) erlaubt. Weitere Verwendung, Anpassung und Verbreitung sind nicht gestattet.",
		oerCompatible: false,
		selectable: true
	},
	{
		name: "CC BY 4.0",
		url: "https://creativecommons.org/licenses/by/4.0/deed.de",
		logoUrl: "http://i.creativecommons.org/l/by/3.0/88x31.png",
		oerCompatible: true,
		selectable: true,
		defaultSuggestion: true
	},
	{
		name: "CC BY SA 4.0",
		url: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
		logoUrl: "http://i.creativecommons.org/l/by-sa/3.0/88x31.png",
		oerCompatible: true,
		selectable: true
	},
	{
		name: "CC0 1.0",
		url: "https://creativecommons.org/publicdomain/zero/1.0/deed.de",
		logoUrl: "http://i.creativecommons.org/p/zero/1.0/88x31.png",
		oerCompatible: true,
		selectable: true
	}
];

export const defaultLicense = license[0];

export async function defaultLicenseId(): Promise<number> {
	const prisma = new PrismaClient();

	try {
		const license = await prisma.license.findFirst({
			where: { name: defaultLicense.name }
		});
		return license?.licenseId ?? 0;
	} finally {
		await prisma.$disconnect();
	}
}
