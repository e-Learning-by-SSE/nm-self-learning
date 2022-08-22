import { DotsCircleHorizontalIcon } from "@heroicons/react/outline";
import { authOptions } from "@self-learning/api";
import { Tab, Tabs } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { getCompletedLessonsThisWeek } from "@self-learning/completion";
import { isToday, isYesterday } from "date-fns";

type LearningDiaryProps = {
	completedLessons: {
		today: ResolvedValue<typeof getCompletedLessonsThisWeek>;
		yesterday: ResolvedValue<typeof getCompletedLessonsThisWeek>;
		week: ResolvedValue<typeof getCompletedLessonsThisWeek>;
	};
};

export const getServerSideProps: GetServerSideProps<LearningDiaryProps> = async ctx => {
	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session?.user?.name) {
		return { redirect: { destination: "/login", permanent: false } };
	}

	const demoDate = Date.now(); // Should be Date.now()

	const completedLessons = await getCompletedLessonsThisWeek(session.user.name, demoDate);
	const { today, yesterday, week } = groupCompletedLessons(completedLessons);

	return {
		props: {
			completedLessons: {
				today,
				yesterday,
				week
			}
		}
	};
};

function groupCompletedLessons(
	completedLessons: ResolvedValue<typeof getCompletedLessonsThisWeek>
) {
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

export default function LearningDiary({ completedLessons }: LearningDiaryProps) {
	console.log(completedLessons);

	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-8 text-5xl">Mein Lerntagebuch</h1>

			<section className="border-card flex flex-col gap-8 bg-white p-4">
				<div className="flex h-full flex-col gap-4">
					<div className="flex justify-between">
						<span className="text-lg font-semibold text-light">Meine Ziele</span>
						<button className="btn-primary text-sm">Speichern</button>
					</div>
					<textarea rows={5} className="h-full" />
				</div>
			</section>

			<div className="mt-8 mb-8">
				<Tabs onChange={index => console.log(index)} selectedIndex={0}>
					<Tab>Aktivität</Tab>
					<Tab>Lernstrategien</Tab>
					<Tab>Aufgaben</Tab>
					<Tab>Reflexionen</Tab>
				</Tabs>
			</div>

			<section className="flex flex-col gap-12">
				{/* <section className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<span className="font-semibold">Letzte Themen</span>
						<span className="text-xs text-light">
							An diesen Themen hast du zuletzt gearbeitet
						</span>
					</div>
					<ul className="grid grid-cols-3 gap-2">
						<TopicProgress />
						<TopicProgress />
						<TopicProgress />
						<TopicProgress />
						<TopicProgress />
					</ul>
				</section> */}

				<section className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<span className="font-semibold">Heute</span>
						<span className="text-xs text-light">
							Du hast heute <span className="font-semibold">42</span> Lerneinheiten
							bearbeitet.
						</span>
					</div>
					<ul className="flex flex-col gap-2 text-sm">
						<CompletedLesson />
						<CompletedLesson />
						<CompletedLesson />
					</ul>
				</section>

				<section className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<span className="font-semibold">Gestern</span>
						<span className="text-xs text-light">
							Du hast gestern <span className="font-semibold">42</span> Lerneinheiten
							bearbeitet.
						</span>
					</div>
					<ul className="flex flex-col gap-2 text-sm">
						<CompletedLesson />
						<CompletedLesson />
						<CompletedLesson />
					</ul>
				</section>

				<section className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<span className="font-semibold">
							Diese Woche{" "}
							<span className="ml-4 text-xs font-normal text-light">
								21.08-28.08.2022
							</span>
						</span>
						<span className="text-xs text-light">
							Du hast diese Woche <span className="font-semibold">42</span>{" "}
							Lerneinheiten bearbeitet.
						</span>
					</div>
					<ul className="flex flex-col gap-2 text-sm">
						<CompletedLesson />
						<CompletedLesson />
						<CompletedLesson />
					</ul>
				</section>

				<section className="flex justify-center">
					<button className="flex flex-col items-center text-sm text-light">
						<span className="font-medium">Vorherige Woche anzeigen</span>
						<DotsCircleHorizontalIcon className="h-6" />
					</button>
				</section>
			</section>
		</CenteredSection>
	);
}

function CompletedLesson() {
	return (
		<li className="border-card flex flex-wrap items-center justify-between gap-2 bg-white p-3">
			<div className="flex flex-col gap-1">
				<span className="font-medium">
					Lorem ipsum dolor sit amet consectetur adipisicing elit
				</span>
				<span className="text-xs text-light">
					in{" "}
					<span className="text-secondary">
						Lorem ipsum dolor sit amet consectetur adipisicing elit
					</span>
				</span>
			</div>
			<div className="text-xs text-light">14:20 Uhr</div>
		</li>
	);
}

function TopicProgress() {
	return (
		<li className="border-card flex flex-col gap-1 bg-white p-4 text-center">
			<span className="text-sm">Lorem ipsum dolor sit amet</span>
			<span className="font-semibold">42%</span>
		</li>
	);
}
