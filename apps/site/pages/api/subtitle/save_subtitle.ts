import { database } from "@self-learning/database";
import { LessonContent, subtitleSrcSchema} from "@self-learning/types";
import { ConvertTranscriptionToSubtitle } from "@self-learning/ui/lesson";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		try {
			const transcription = req.body.transcription;
			const token = req.headers.authorization?.replace('Bearer ', '');
			const lessonId = req.body.lessonId;
			
			try {
				const secret = process.env.NEXTAUTH_SECRET ?? "";
				jwt.verify(token ?? "", secret);
			} catch (e) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			const subtitleSrc = subtitleSrcSchema.parse(transcription);
			const subtitle = await ConvertTranscriptionToSubtitle(subtitleSrc);

			const lesson = await database.lesson.findUnique({
				where: {
					lessonId: lessonId
				}
			});
			if (!lesson) {
				return res.status(404).json({ message: "Lesson not found" });
			}

			const content = lesson.content as LessonContent | undefined;

			if (!content || content.length === 0) {
				return res.status(404).json({ message: "Content not found" });
			}

			await database.lesson.update({
				where: {
					lessonId: lessonId
				},
				data: {
					content: content.map(c =>
						c.type === "video"
							? {
									...c,
									value: {
										...c.value,
										subtitle: {
											src: subtitle,
											label: "Deutsch",
											srcLang: subtitleSrc.language ?? "de"
										}
									}
								}
							: c
					)
				}
			});

			console.log("Subtitle saved external");

			return res.status(200).json({ message: "Subtitle saved" });
		} catch (e) {
			console.error(e);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	} else {
		return res.status(405).json({ message: "Method Not Allowed" });
	}
}
