import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	try {
		await prisma.$transaction(async tx => {
			const repositories = await tx.skillRepository.findMany({
				include: {
					// @ts-expect-error User was renamed to owner
					User: true
				}
			});
			for (const repository of repositories) {
				await tx.skillRepository.update({
					where: { id: repository.id },
					data: {
						// @ts-expect-error User was renamed to owner
						ownerName: repository.User.name
					}
				});
			}
		});
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
