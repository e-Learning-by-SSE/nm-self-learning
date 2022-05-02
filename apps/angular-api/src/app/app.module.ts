import { Module } from "@nestjs/common";

import { Enrollments } from "./enrollments.controller";
import { PrismaService } from "./prisma.service";

@Module({
	imports: [],
	controllers: [Enrollments],
	providers: [PrismaService]
})
export class AppModule {}
