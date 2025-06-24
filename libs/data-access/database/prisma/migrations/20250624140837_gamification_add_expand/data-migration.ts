import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$transaction(async tx => {
            const userSettings = await tx.user.findMany({});

            const promises = userSettings.map(async user => {
                return tx.features.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        username: user.name,
                        learningDiary: user.enabledFeatureLearningDiary,
                        learningStatistics: user.enabledLearningStatistics
                    },
                    update: {
                        learningDiary: user.enabledFeatureLearningDiary,
                        learningStatistics: user.enabledLearningStatistics
                    }
                });
            });

            await Promise.all(promises);
        });
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
