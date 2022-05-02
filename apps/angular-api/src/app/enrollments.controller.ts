import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma.service";
import { EnrollmentDto } from "./user.dto";

@ApiTags("enrollment")
@Controller("enrollments")
export class Enrollments {
	constructor(private readonly prisma: PrismaService) {}

	@Get(":username")
	async getEnrollmentsOfUser(@Param("username") username: string): Promise<EnrollmentDto[]> {
		const enrollments = await this.prisma.enrollments.findMany({
			where: { username },
			include: {
				course: true
			}
		});

		return enrollments;
	}
}
