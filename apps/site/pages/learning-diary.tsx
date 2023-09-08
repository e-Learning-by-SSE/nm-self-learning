import { ArrowCircleRightIcon, CheckIcon, PlusIcon, XIcon } from "@heroicons/react/outline";
import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import { CenteredSection } from "@self-learning/ui/layouts";
import { endOfWeek, format, isToday, isYesterday, parseISO, startOfWeek } from "date-fns";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ReactElement, useRef, useState } from "react";
import { Tab, Disclosure } from "@headlessui/react";
import { GoalType, LearningStrategy } from "@prisma/client";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { GoalEditor, GoalFormModel } from "@self-learning/learning-diary";
import { trpc } from "libs/data-access/api-client/src/lib/trpc";
import { showToast } from "@self-learning/ui/common";
import { useRouter } from "next/router";

type CompletedLesson = ResolvedValue<typeof getCompletedLessonsThisWeek>[0];
type LearningGoal = ResolvedValue<typeof getGoals>[0];
type DiaryEntry = ResolvedValue<typeof getEntries>[0];

type LearningDiaryProps = {
	completedLessons: {
		today: CompletedLesson[];
		yesterday: CompletedLesson[];
		week: CompletedLesson[];
	};
	goals: LearningGoal[];
	entries: {
		today: DiaryEntry[];
		yesterday: DiaryEntry[];
		week: DiaryEntry[];
	};
};

function classNames(...classes: any[]) {
	return classes.filter(Boolean).join(" ");
}

export const getServerSideProps: GetServerSideProps<LearningDiaryProps> = async ctx => {
	const session = await getServerSession(ctx.req, ctx.res, authOptions);

	if (!session?.user?.name) {
		return { redirect: { destination: "/login?callbackUrl=learning-diary", permanent: false } };
	}

	const [completedLessons, goals, entries] = await Promise.all([
		JSON.parse(
			JSON.stringify(await getCompletedLessonsThisWeek(session.user.name, Date.now()))
		),
		/*database.learningDiary.findUnique({
			where: { username: session.user.name },
			include: { goals: true }
		}),*/
		JSON.parse(JSON.stringify(await getGoals(session.user.name))),
		JSON.parse(JSON.stringify(await getEntries(session.user.name)))
	]);

	return {
		props: {
			goals: goals,
			completedLessons: groupCompletedLessons(completedLessons),
			entries: groupEntries(entries)
		}
	};
};

function getGoals(username: string) {
	return database.learningGoal.findMany({
		select: {
			id: true,
			achieved: true,
			priority: true,
			type: true,
			actualValue: true,
			targetValue: true,
			createdAt: true,
			description: true,
			diaryID: true,
			learningTime: true
		},
		orderBy: {
			priority: "asc"
		},
		where: {
			diaryID: username
		}
	});
}

function getEntries(username: string) {
	return database.diaryEntry.findMany({
		include: {
			learningStrategies: true,
			completedLesson: {
				include: {
					lesson: true,
					course: true
				}
			}
		},
		where: {
			diaryID: username
		}
	});
}

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
				},
				diaryEntry: null
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
		if (isToday(parseISO(lesson.createdAt as unknown as string))) {
			today.push(lesson);
		} else if (isYesterday(parseISO(lesson.createdAt as unknown as string))) {
			yesterday.push(lesson);
		} else {
			week.push(lesson);
		}
	}
	return { today, yesterday, week };
}

function groupEntries(entries: DiaryEntry[]): LearningDiaryProps["entries"] {
	const today = [];
	const yesterday = [];
	const week = [];

	for (const entry of entries) {
		if (
			entry.completedLesson != null &&
			isToday(parseISO(entry.completedLesson.createdAt as unknown as string))
		) {
			today.push(entry);
		} else if (
			entry.completedLesson != null &&
			isYesterday(parseISO(entry.completedLesson.createdAt as unknown as string))
		) {
			yesterday.push(entry);
		} else {
			week.push(entry);
		}
	}
	return { today, yesterday, week };
}

function Goal({
	id,
	description = "",
	priority,
	targetValue,
	actualValue,
	achieved
}: {
	id: string;
	description: string;
	priority: number;
	targetValue: number;
	actualValue: number;
	achieved: boolean;
}) {
	const { mutateAsync: incrementActualValueForGoal } =
		trpc.learningDiary.incrementActualValueForGoal.useMutation();
	const { mutateAsync: markGoalAsAchieved } = trpc.learningDiary.markGoalAsAchieved.useMutation();
	const { mutateAsync: deleteGoal } = trpc.learningDiary.deleteGoal.useMutation();
	const router = useRouter();

	async function incrementGoal() {
		actualValue = actualValue + 1;

		const result = await incrementActualValueForGoal({
			id: id,
			actualValue: actualValue
		});
		console.log(result);

		if (actualValue == targetValue) {
			const result = await markGoalAsAchieved({ id: id });
			console.log(result);
		}
		router.replace(router.asPath);
	}

	async function markAsAchievedGoal() {
		const result = await markGoalAsAchieved({ id: id });
		console.log(result);
		router.replace(router.asPath);
	}

	async function delGoal() {
		const result = await deleteGoal({ id: id });
		console.log(result);
		router.replace(router.asPath);
	}

	return (
		<div className="flex flex-row items-center">
			{targetValue > 0 && (
				<div className="mx-auto flex w-full flex-row justify-between gap-4">
					<div>
						{description} {actualValue} / {targetValue} (Priorität: {priority})
					</div>
					{!achieved && (
						<button
							id={id}
							onClick={incrementGoal}
							className="btn-small place-content-center items-center"
							title="Ist Wert erhöhen"
						>
							<PlusIcon className="h-3 w-3" />
						</button>
					)}
				</div>
			)}
			{targetValue == 0 && (
				<div className="mx-auto flex w-full flex-row justify-between gap-4">
					<div>
						{description} (Priorität: {priority})
					</div>
					{!achieved && (
						<button
							onClick={markAsAchievedGoal}
							className="btn-small place-content-center items-center"
							title="Als erfüllt markieren"
						>
							<CheckIcon className="h-3 w-3" />
						</button>
					)}
				</div>
			)}
			<button
				onClick={delGoal}
				className="btn-small place-content-center items-center"
				title="Ziel Löschen"
			>
				<XIcon className="h-3 w-3" />
			</button>
		</div>
	);
}

function getGoalType(type: GoalType) {
	let out: string;
	switch (type) {
		case "NUMBEROFLESSONS":
			out = "Abgeschlossene Lerneinheiten pro Woche:";
			break;
		case "NUMBEROFQUIZATTEMPTS":
			out = "Absolvierte Quizversuche pro Woche:";
			break;
		default:
			out = "error";
			break;
	}
	return out;
}

function TabGoals({ goals }: LearningDiaryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showForm, setShowForm] = useState(false);
	const { mutateAsync: createGoal } = trpc.learningDiary.createGoal.useMutation();
	const router = useRouter();

	async function onConfirm(goal: GoalFormModel) {
		if (goal.description === "") {
			goal.description = getGoalType(goal.type);
		}
		try {
			const result = await createGoal(goal);
			console.log(result);
			showToast({
				type: "success",
				title: "Ziel erstellt!",
				subtitle: result.id
			});
			setShowForm(false);
			router.replace(router.asPath);
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Das Ziel konnte nicht erstellt werden. Siehe Konsole für mehr Informationen."
			});
		}
	}

	const toggleShowForm = () => {
		setShowForm(!showForm);
	};
	return (
		<section className="border-card flex w-full flex-col gap-8 bg-white p-4">
			<span className="text-lg font-semibold text-light">Meine Ziele</span>

			<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
				<Tab.List className="flex w-full flex-wrap gap-4 border-b border-light-border">
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Offene
					</Tab>
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Erledigt
					</Tab>
				</Tab.List>
				<Tab.Panels className="flex flex-grow flex-col gap-12">
					<Tab.Panel>
						<ul className="flex flex-col gap-1 text-sm">
							{goals
								.filter(i => i.achieved === false)
								.map(
									({
										id,
										description,
										priority,
										targetValue,
										actualValue,
										achieved
									}) => (
										<Goal
											key={id}
											id={id}
											description={description}
											priority={priority}
											targetValue={targetValue}
											actualValue={actualValue}
											achieved={achieved}
										/>
									)
								)}
						</ul>
					</Tab.Panel>
					<Tab.Panel>
						<ul className="flex flex-col gap-2 text-sm">
							{goals
								.filter(i => i.achieved === true)
								.map(
									({
										id,
										description,
										priority,
										targetValue,
										actualValue,
										achieved
									}) => (
										<Goal
											key={id}
											id={id}
											description={description}
											priority={priority}
											targetValue={targetValue}
											actualValue={actualValue}
											achieved={achieved}
										/>
									)
								)}
						</ul>
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
			<div>
				{!showForm && (
					<button className="btn-primary w-full" onClick={toggleShowForm}>
						Neues Ziel erstellen
					</button>
				)}

				{showForm && (
					<GoalEditor
						onConfirm={onConfirm}
						goal={{
							id: "",
							description: "",
							achieved: false,
							priority: 1,
							targetValue: 0,
							actualValue: 0,
							type: "USERSPECIFIC"
						}}
					/>
				)}
			</div>
			{showForm && (
				<button className="btn-primary w-full" onClick={toggleShowForm}>
					Abbrechen
				</button>
			)}
		</section>
	);
}

function Strategies({ initialValue }: { initialValue: string }) {
	const inputRef = useRef<HTMLTextAreaElement>(null);

	return (
		<section className="border-card flex flex-col gap-8 bg-white p-4">
			<div className="flex h-full flex-col gap-4">
				<div className="flex justify-between">
					<span className="text-lg font-semibold text-light">Überblick Strategien</span>
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
					<CompletedLessonDisclosure
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

function EntriesSection({
	title,
	subtitle,
	entries
}: {
	title: string;
	subtitle: (amount: ReactElement) => ReactElement;
	entries: DiaryEntry[];
}) {
	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="font-semibold">{title}</span>
				<span className="text-xs text-light">
					{subtitle(<span className="font-semibold">{entries.length}</span>)}
				</span>
			</div>
			<ul className="flex flex-col gap-2 text-sm">
				{entries.map(
					({ id, completedLesson, distractions, efforts, learningStrategies, notes }) => (
						<EntriesDisclosure
							key={id}
							completedLesson={completedLesson}
							distractions={distractions}
							efforts={efforts}
							learningStrategies={learningStrategies}
							notes={notes}
						/>
					)
				)}
			</ul>
		</section>
	);
}

function EntriesDisclosure({
	completedLesson,
	distractions = "",
	efforts = "",
	learningStrategies,
	notes = ""
}: {
	distractions: string | null;
	efforts: string | null;
	learningStrategies: LearningStrategy[] | null;
	notes: string | null;
	completedLesson: CompletedLesson | null;
}) {
	let button: any;
	let panel: any;
	if (completedLesson != null) {
		button = (
			<div>
				{completedLesson.lesson.title} -{" "}
				{format(
					parseISO(completedLesson.createdAt as unknown as string),
					"HH:mm dd-MM-yyyy"
				)}
			</div>
		);
		panel = (
			<div>
				<Link
					href={
						completedLesson.course
							? `/courses/${completedLesson.course.slug}/${completedLesson.lesson.slug}`
							: `/lessons/${completedLesson.lesson.slug}`
					}
					className="font-medium"
				>
					{completedLesson.lesson.title}
				</Link>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-light">
						in{" "}
						<span className="text-secondary">
							{completedLesson.course
								? completedLesson.course.title
								: completedLesson.lesson.title}
						</span>
					</span>
				</div>
				<div className="text-xs text-light">
					{format(
						parseISO(completedLesson.createdAt as unknown as string),
						"HH:mm dd-MM-yyyy"
					)}
				</div>{" "}
			</div>
		);
	} else {
		button = <div> Ein Eintrag </div>;
		panel = <div>Todo</div>;
	}
	return (
		<li className="flex flex-wrap items-center justify-between gap-2 bg-white">
			<div className="mx-auto w-full max-w-md rounded-2xl bg-white">
				<Disclosure>
					{({ open }) => (
						<>
							<Disclosure.Button className="flex w-full justify-between rounded-lg text-left font-medium hover:text-secondary focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
								{button}
								<ChevronRightIcon
									className={open ? "h-5 w-5 rotate-90 transform" : "h-5 w-5"}
								/>
							</Disclosure.Button>
							<Disclosure.Panel className="text-gray-500">{panel}</Disclosure.Panel>
						</>
					)}
				</Disclosure>
			</div>
		</li>
	);
}

function CompletedLessonDisclosure({
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
		<li className="flex flex-wrap items-center justify-between gap-2 bg-white">
			<div className="mx-auto w-full max-w-md rounded-2xl bg-white">
				<Disclosure>
					{({ open }) => (
						<>
							<Disclosure.Button className="flex w-full justify-between rounded-lg text-left font-medium hover:text-secondary focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
								{title} -{" "}
								{format(parseISO(date as unknown as string), "HH:mm dd-MM-yyyy")}
								<ChevronRightIcon
									className={open ? "h-5 w-5 rotate-90 transform" : "h-5 w-5"}
								/>
							</Disclosure.Button>
							<Disclosure.Panel className="text-gray-500">
								<Link href={href} className="font-medium">
									{title}
								</Link>
								<div className="flex flex-col gap-1">
									<span className="text-xs text-light">
										in <span className="text-secondary">{topic}</span>
									</span>
								</div>
								<div className="text-xs text-light">
									{format(
										parseISO(date as unknown as string),
										"HH:mm dd-MM-yyyy"
									)}
								</div>
							</Disclosure.Panel>
						</>
					)}
				</Disclosure>
			</div>
		</li>
	);
}

function TabGroupEntries({ completedLessons, entries }: LearningDiaryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	return (
		<section className="flex w-full flex-col gap-8 bg-white p-4">
			<span className="text-lg font-semibold text-light">Meine Einträge</span>
			<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
				<Tab.List className="flex w-full flex-wrap border-b border-light-border">
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Alle
					</Tab>
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Zu ergänzen
					</Tab>
				</Tab.List>
				<Tab.Panels className="flex-grow flex-col gap-12">
					<Tab.Panel>
						<section>
							<EntriesSection
								title="Heute"
								subtitle={amount => <>Deine heutigen Tagebucheinträge: {amount}.</>}
								entries={entries.today}
							/>
							<EntriesSection
								title="Gestern"
								subtitle={amount => (
									<>Deine gestrigen Tagebucheinträge: {amount}.</>
								)}
								entries={entries.yesterday}
							/>
							<EntriesSection
								title="Diese Woche"
								subtitle={amount => (
									<>Deine restlichen Tagebucheinträge: {amount}.</>
								)}
								entries={entries.week}
							/>
							<section>
								<button className="flex flex-row items-end gap-2 text-sm text-light">
									<span className="font-medium">Vorherige Woche anzeigen</span>
									<ArrowCircleRightIcon className="h-6" />
								</button>
							</section>
						</section>
					</Tab.Panel>
					<Tab.Panel>
						<section>
							<CompletedSection
								title="Heute"
								subtitle={amount => (
									<>Du hast heute {amount} Lerneinheiten bearbeitet.</>
								)}
								completedLessons={completedLessons.today}
							/>
							<CompletedSection
								title="Gestern"
								subtitle={amount => (
									<>Du hast gestern {amount} Lerneinheiten bearbeitet.</>
								)}
								completedLessons={completedLessons.yesterday}
							/>
							<CompletedSection
								title="Diese Woche"
								subtitle={amount => (
									<>
										Du hast in dieser Woche {amount} weitere Lerneinheiten
										bearbeitet.
									</>
								)}
								completedLessons={completedLessons.week}
							/>
							<section>
								<button className="flex flex-row items-end gap-2 text-sm text-light">
									<span className="font-medium">Vorherige Woche anzeigen</span>
									<ArrowCircleRightIcon className="h-6" />
								</button>
							</section>
						</section>
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</section>
	);
}

export default function LearningDiary(props: LearningDiaryProps) {
	return (
		<CenteredSection className="flex bg-gray-50">
			<h1 className="mb-16 text-5xl">Mein Lerntagebuch</h1>
			<section className="flew-row flex w-full gap-5">
				<TabGroupEntries
					completedLessons={props.completedLessons}
					goals={[]}
					entries={props.entries}
				/>

				<section className="flex w-full flex-col gap-5">
					<TabGoals
						goals={props.goals}
						completedLessons={{
							today: [],
							yesterday: [],
							week: []
						}}
						entries={{
							today: [],
							yesterday: [],
							week: []
						}}
					/>
					<Strategies initialValue={""} />
				</section>
			</section>
		</CenteredSection>
	);
}
