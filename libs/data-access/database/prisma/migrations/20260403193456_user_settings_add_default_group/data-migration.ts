import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function migrateAuthorsAddDefaultGroup(tx: Prisma.TransactionClient): Promise<void> {
	// for each user which has 1 membership, set default group to that group
	const users = await tx.user.findMany({
		include: {
			_count: {
				select: { Member: true }
			},
			Member: {
				take: 1 // we filter for single membership, so we dont need all memberships
			}
		}
	});

	const filteredUsers = users.filter(user => user._count.Member === 1);
	for (const user of filteredUsers) {
		await tx.user.update({
			where: { id: user.id },
			data: { defaultGroupId: user.Member[0].groupId }
		});
	}
}

async function main() {
	try {
		await prisma.$transaction(async tx => {
			await migrateAuthorsAddDefaultGroup(tx);
		});
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
