import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function main() {
	await prisma.$transaction(async tx => {
		const repositories = await tx.skillRepository.findMany({ include: { User: true } });
		for (const repository of repositories) {
			await tx.skillRepository.update({
				where: { id: repository.id },
				data: {
					ownerName: repository.User.name
				}
			});
		}
	});
}
