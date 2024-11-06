import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	await prisma.$transaction(async tx => {
		const repositories = await tx.skillRepository.findMany({ include: { owner: true } });
		for (const repository of repositories) {
			await tx.skillRepository.update({
				where: { id: repository.id },
				data: {
					ownerName: repository.owner.name
				}
			});
		}
	});
}

main()
	.catch(async e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => await prisma.$disconnect());
