import jwt from "jsonwebtoken";
import { database } from "@self-learning/database";
import { Prisma } from "@prisma/client";
import { Session } from "next-auth";

export async function generateTokenForUser(where: Prisma.UserWhereUniqueInput) {
	const sharedPrivateKey = process.env["NEXTAUTH_SECRET"] ?? "default";

	const user = await database.user.findUnique({
		where,
		select: {
			id: true,
			name: true,
			role: true,
			author: true,
			featureFlags: true
		}
	});

	if (!user) {
		throw new Error("User not found");
	}

	const sessionUser: Session["user"] = {
		id: user.id,
		name: user.name,
		role: user.role,
		isAuthor: user.author !== null,
		featureFlags: {
			learningDiary: user.featureFlags?.learningDiary ?? false,
			learningStatistics: user.featureFlags?.learningStatistics ?? false,
			experimental: user.featureFlags?.experimental ?? false
		}
	};

	const token = jwt.sign(sessionUser, sharedPrivateKey, {
		expiresIn: "1d"
	});
	return token;
}
