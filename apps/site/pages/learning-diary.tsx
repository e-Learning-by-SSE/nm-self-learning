import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { authOptions } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { endOfWeek, format, isToday, isYesterday, parseISO, startOfWeek } from "date-fns";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import Link from "next/link";
import { ReactElement, useRef } from "react";

type CompletedLesson = ResolvedValue<typeof getCompletedLessonsThisWeek>[0];

type LearningDiaryProps = {
	completedLessons: {
		today: CompletedLesson[];
		yesterday: CompletedLesson[];
		week: CompletedLesson[];
	};
	goals: string;
};

export const getServerSideProps: GetServerSideProps<LearningDiaryProps> = async ctx => {
	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session?.user?.name) {
		return { redirect: { destination: "/login?callbackUrl=learning-diary", permanent: false } };
	}

	const [completedLessons, learningDiary] = await Promise.all([
		getCompletedLessonsThisWeek(session.user.name, Date.now()),
		database.learningDiary.findUnique({
			where: { username: session.user.name },
			select: { goals: true }
		})
	]);

	return {
		props: {
			goals: learningDiary?.goals ?? "",
			completedLessons: groupCompletedLessons(completedLessons)
		}
	};
};

async function getCompletedLessonsThisWeek(username: string, dateNow: number) {
	return database.completedLesson.findMany({
		select: {
			createdAt: true,
			course: {
				select: {
					title: true,
					slug: true
				}
			},
			lesson: {
				select: {
					lessonId: true,
					title: true,
					slug: true
				}
			}
		},
		where: {
			AND: {
				username,
				createdAt: {
					gte: startOfWeek(dateNow, { weekStartsOn: 1 }),
					lte: endOfWeek(dateNow, { weekStartsOn: 1 })
				}
			}
		}
	});
}

function groupCompletedLessons(
	completedLessons: CompletedLesson[]
): LearningDiaryProps["completedLessons"] {
	const today = [];
	const yesterday = [];
	const week = [];

	for (const lesson of completedLessons) {
		if (isToday(lesson.createdAt)) {
			today.push(lesson);
		} else if (isYesterday(lesson.createdAt)) {
			yesterday.push(lesson);
		} else {
			week.push(lesson);
		}
	}
	return { today, yesterday, week };
}

export default function LearningDiary({ completedLessons, goals }: LearningDiaryProps) {
	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">Mein Lerntagebuch</h1>

			<Goals initialValue={goals} />

			<section className="mt-8 flex flex-col gap-12">
				<CompletedSection
					title="Heute"
					subtitle={amount => <>Du hast heute {amount} Lerneinheiten bearbeitet.</>}
					completedLessons={completedLessons.today}
				/>
				<CompletedSection
					title="Gestern"
					subtitle={amount => <>Du hast gestern {amount} Lerneinheiten bearbeitet.</>}
					completedLessons={completedLessons.yesterday}
				/>
				<CompletedSection
					title="Diese Woche"
					subtitle={amount => (
						<>Du hast in dieser Woche {amount} weitere Lerneinheiten bearbeitet.</>
					)}
					completedLessons={completedLessons.week}
				/>

				<section className="flex justify-end">
					<button className="flex flex-col items-end gap-2 text-sm text-light">
						<span className="font-medium">Vorherige Woche anzeigen</span>
						<ArrowRightCircleIcon className="h-6" />
					</button>
				</section>
			</section>
		</CenteredSection>
	);
}

function Goals({ initialValue }: { initialValue: string }) {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const { mutate, isLoading: isSaving } = trpc.learningDiary.setGoals.useMutation({
		onSettled(_data, error) {
			if (error) {
				console.error(error);
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: "Deine Ziele konnten nicht gespeichert werden."
				});
			} else {
				showToast({
					type: "success",
					title: "Gespeichert",
					subtitle: "Deine Ziele wurden erfolgreich gespeichert."
				});
			}
		}
	});

	return (
		<section className="border-card flex flex-col gap-8 bg-white p-4">
			<div className="flex h-full flex-col gap-4">
				<div className="flex justify-between">
					<span className="text-lg font-semibold text-light">Meine Ziele</span>
					<button
						className="btn-primary text-sm"
						disabled={isSaving}
						onClick={() => mutate({ goals: inputRef.current?.value ?? "" })}
					>
						Speichern
					</button>
				</div>

				<textarea ref={inputRef} defaultValue={initialValue} rows={5} className="h-full" />
			</div>
		</section>
	);
}

function CompletedSection({
	title,
	subtitle,
	completedLessons
}: {
	title: string;
	subtitle: (amount: ReactElement) => ReactElement;
	completedLessons: CompletedLesson[];
}) {
	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="font-semibold">{title}</span>
				<span className="text-xs text-light">
					{subtitle(<span className="font-semibold">{completedLessons.length}</span>)}
				</span>
			</div>
			<ul className="flex flex-col gap-2 text-sm">
				{completedLessons.map(({ lesson, createdAt, course }) => (
					<CompletedLesson
						key={lesson.lessonId}
						title={lesson.title}
						topic={course ? course.title : lesson.title}
						href={
							course
								? `/courses/${course.slug}/${lesson.slug}`
								: `/lessons/${lesson.slug}`
						}
						date={createdAt}
					/>
				))}
			</ul>
		</section>
	);
}

function CompletedLesson({
	title,
	href,
	topic,
	date
}: {
	title: string;
	href: string;
	topic: string;
	date: Date;
}) {
	return (
		<li className="border-card flex flex-wrap items-center justify-between gap-2 bg-white p-3">
			<div className="flex flex-col gap-1">
				<Link href={href} className="font-medium">
					{title}
				</Link>
				<span className="text-xs text-light">
					in <span className="text-secondary">{topic}</span>
				</span>
			</div>
			<div className="text-xs text-light">
				{format(parseISO(date as unknown as string), "HH:mm")}
			</div>
		</li>
	);
}
