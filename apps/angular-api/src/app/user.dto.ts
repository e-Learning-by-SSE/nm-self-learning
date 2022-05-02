import type { Course, Enrollments, User } from "@prisma/client";

export class UserDto implements User {
	displayName: string;
	username: string;
}

export class EnrollmentDto implements Enrollments {
	completedAt: Date | null;
	courseId: string;
	createdAt: Date;
	status: string;
	username: string;
}

export class EnrollmentDto_Course extends EnrollmentDto {
	course: CourseDto;
}

export class CourseDto implements Course {
	id: string;
	slug: string;
}
