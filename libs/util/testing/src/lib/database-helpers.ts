import { database, Prisma } from "@self-learning/database/server";

export async function createTestUser(username: string) {
	const user: Prisma.UserCreateInput = {
		name: username,
		id: username,
		displayName: username,
		accounts: {
			create: [
				{
					id: username,
					provider: "test",
					providerAccountId: username,
					type: "test-account"
				}
			]
		},
		student: {
			create: {
				username
			}
		},
		featureFlags: {
			create: {
				username
			}
		}
	};

	return await database.user.upsert({
		where: { name: username },
		create: user,
		update: {}
	});
}

export async function createLicense(licenseId: number) {
	const license: Prisma.LicenseUncheckedCreateInput = {
		licenseId: licenseId,
		name: `License ${licenseId}`
	};

	await database.license.upsert({
		where: { licenseId: licenseId },
		create: license,
		update: {}
	});
}
