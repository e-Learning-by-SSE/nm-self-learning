import { CheckIcon, PlusIcon, XIcon } from "@heroicons/react/outline";
import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { ResolvedValue, StrategyOverview, getStrategyNameByType } from "@self-learning/types";
import { CenteredContainerXL } from "@self-learning/ui/layouts";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { ReactElement, useState } from "react";
import { Tab } from "@headlessui/react";
import { Course, GoalType, LearningStrategy, Lesson, StrategyType } from "@prisma/client";
import {
	EntryEditor,
	EntryFormModel,
	GoalEditor,
	GoalFormModel,
	Lessons
} from "@self-learning/learning-diary";
import { trpc } from "libs/data-access/api-client/src/lib/trpc";
import { showToast } from "@self-learning/ui/common";
import { useRouter } from "next/router";

type CompletedLesson = ResolvedValue<typeof getCompletedLessonsThisWeek>[0];
type LearningGoal = ResolvedValue<typeof getGoals>[0];
type DiaryEntry = ResolvedValue<typeof getEntries>[0];
type SelectEntryFunction = (id: string) => void;
type SelectCompletedLessonFunction = (lessonId: string, completedLessonId: number) => void;

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
			},
			lesson: true
		},
		where: {
			diaryID: username
		}
	});
}

async function getCompletedLessonsThisWeek(username: string, dateNow: number) {
	return database.completedLesson.findMany({
		select: {
			completedLessonId: true,
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
		if (isToday(parseISO(entry.createdAt as unknown as string))) {
			today.push(entry);
		} else if (isYesterday(parseISO(entry.createdAt as unknown as string))) {
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
				subtitle: ""
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

function StrategyOverviews() {
	const { data: strategyOverviews } = trpc.learningDiary.getStrategyOverview.useQuery();
	return (
		<section className="border-card flex flex-col gap-8 bg-white p-4">
			<div className="flex h-full flex-col justify-between gap-4">
				<span className="text-sm font-semibold text-light">Überblick Strategien</span>
				<div className="flex h-full flex-row justify-between gap-4">
					<span className="text-sm font-semibold text-light">Strategy</span>
					<span className="text-sm font-semibold text-light">
						Vertrauensbewertung (avg):
					</span>
					<span className="text-sm font-semibold text-light">Summe der Nutzungen</span>
				</div>
				{strategyOverviews
					?.filter(i => i.type != StrategyType.USERSPECIFIC)
					.map(({ type, _avg, _count }) => (
						<Strategy
							key={type}
							type={type}
							_count={{
								type: _count.type
							}}
							_avg={{
								confidenceRating: _avg.confidenceRating
							}}
						/>
					))}
			</div>
		</section>
	);
}
function Strategy(strategyOverview: StrategyOverview) {
	return (
		<div className="flex h-full flex-row justify-between gap-4">
			<span className="text-sm font-semibold text-light">
				{getStrategyNameByType(strategyOverview.type)}
			</span>
			<span className="text-sm font-semibold text-light">
				{strategyOverview._avg.confidenceRating}
			</span>
			<span className="text-sm font-semibold text-light">{strategyOverview._count.type}</span>
		</div>
	);
}

function CompletedSection({
	selectCompletedLesson,
	title,
	subtitle,
	completedLessons
}: {
	selectCompletedLesson: SelectCompletedLessonFunction;
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
				{completedLessons.map(({ lesson, createdAt, completedLessonId }) => (
					<CompletedLessonList
						key={lesson.lessonId}
						lessonId={lesson.lessonId}
						completedLessonId={completedLessonId}
						title={lesson.title}
						date={createdAt}
						selectCompletedLesson={selectCompletedLesson}
					/>
				))}
			</ul>
		</section>
	);
}

function EntriesSection({
	selectEntry,
	title,
	subtitle,
	entries
}: {
	selectEntry: SelectEntryFunction;
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
				{entries.map(({ id, completedLesson, lesson, createdAt }) => (
					<EntriesList
						key={id}
						id={id}
						lesson={lesson}
						completedLesson={completedLesson}
						createdAt={createdAt}
						selectEntry={selectEntry}
					/>
				))}
			</ul>
		</section>
	);
}

function EntriesList({
	id,
	completedLesson,
	lesson,
	createdAt,
	selectEntry
}: {
	id: string;
	completedLesson: CompletedLesson | null;
	lesson: Lesson | null;
	createdAt: Date;
	selectEntry: SelectEntryFunction;
}) {
	let title: string;
	if (completedLesson != null) {
		title =
			completedLesson.lesson.title +
			" " +
			format(parseISO(completedLesson.createdAt as unknown as string), "HH:mm dd-MM-yyyy");
	} else if (lesson != null) {
		title =
			lesson.title +
			" " +
			format(parseISO(createdAt as unknown as string), "HH:mm dd-MM-yyyy");
	} else {
		title = "Eintrag - " + format(parseISO(createdAt as unknown as string), "HH:mm dd-MM-yyyy");
	}
	return (
		<li className="flex flex-wrap items-center justify-between gap-2 bg-white">
			<button className="link" onClick={() => selectEntry(id)}>
				{title}
			</button>
		</li>
	);
}

function CompletedLessonList({
	lessonId,
	completedLessonId,
	title,
	date,
	selectCompletedLesson
}: {
	lessonId: string;
	completedLessonId: number;
	title: string;
	date: Date;
	selectCompletedLesson: SelectCompletedLessonFunction;
}) {
	return (
		<li className="flex flex-wrap items-center justify-between gap-2 bg-white">
			<div className="mx-auto w-full max-w-md rounded-2xl bg-white">
				<button
					className="link"
					onClick={() => selectCompletedLesson(lessonId, completedLessonId)}
				>
					{title} - {format(parseISO(date as unknown as string), "HH:mm dd-MM-yyyy")}
				</button>
			</div>
		</li>
	);
}

export function TabGroupEntries({
	selectEntry,
	selectCompletedLesson,
	completedLessons,
	entries
}: {
	selectEntry: SelectEntryFunction;
	selectCompletedLesson: SelectCompletedLessonFunction;
	completedLessons: {
		today: {
			completedLessonId: number;
			createdAt: Date;
			lesson: { title: string; slug: string; lessonId: string };
			course: { title: string; slug: string } | null;
		}[];
		yesterday: {
			completedLessonId: number;
			createdAt: Date;
			lesson: { title: string; slug: string; lessonId: string };
			course: { title: string; slug: string } | null;
		}[];
		week: {
			completedLessonId: number;
			createdAt: Date;
			lesson: { title: string; slug: string; lessonId: string };
			course: { title: string; slug: string } | null;
		}[];
	};
	entries: {
		today: (DiaryEntry & {
			learningStrategies: LearningStrategy[];
			lesson: Lesson | null;
			completedLesson: (CompletedLesson & { lesson: Lesson; course: Course | null }) | null;
		})[];
		yesterday: (DiaryEntry & {
			learningStrategies: LearningStrategy[];
			lesson: Lesson | null;
			completedLesson: (CompletedLesson & { lesson: Lesson; course: Course | null }) | null;
		})[];
		week: (DiaryEntry & {
			learningStrategies: LearningStrategy[];
			lesson: Lesson | null;
			completedLesson: (CompletedLesson & { lesson: Lesson; course: Course | null }) | null;
		})[];
	};
}) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	return (
		<section className="border-card flex w-full flex-col gap-8 bg-white p-4">
			<span className="text-lg font-semibold text-light">Meine Einträge</span>
			<button className="btn-primary w-full" onClick={() => selectEntry("")}>
				Neue Eintrag erstellen
			</button>

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
								selectEntry={selectEntry}
								title="Heute"
								subtitle={amount => <>Deine heutigen Tagebucheinträge: {amount}.</>}
								entries={entries.today}
							/>
							<EntriesSection
								selectEntry={selectEntry}
								title="Gestern"
								subtitle={amount => (
									<>Deine gestrigen Tagebucheinträge: {amount}.</>
								)}
								entries={entries.yesterday}
							/>
							<EntriesSection
								selectEntry={selectEntry}
								title="Alle Einträge"
								subtitle={amount => (
									<>Deine restlichen Tagebucheinträge: {amount}.</>
								)}
								entries={entries.week}
							/>
						</section>
					</Tab.Panel>
					<Tab.Panel>
						<section>
							<CompletedSection
								selectCompletedLesson={selectCompletedLesson}
								title="Heute"
								subtitle={amount => (
									<>Du hast heute {amount} Lerneinheiten bearbeitet.</>
								)}
								completedLessons={completedLessons.today}
							/>
							<CompletedSection
								selectCompletedLesson={selectCompletedLesson}
								title="Gestern"
								subtitle={amount => (
									<>Du hast gestern {amount} Lerneinheiten bearbeitet.</>
								)}
								completedLessons={completedLessons.yesterday}
							/>
							<CompletedSection
								selectCompletedLesson={selectCompletedLesson}
								title="Alle Einträge"
								subtitle={amount => (
									<>Du hast {amount} weitere Lerneinheiten bearbeitet.</>
								)}
								completedLessons={completedLessons.week}
							/>
						</section>
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</section>
	);
}

function Entry(diaryEntry: DiaryEntry) {
	function fetchCourseSlugsByUser() {
		const { data: enrollments } = trpc.enrollment.getEnrollments.useQuery();
		const course: string[] = [];

		if (enrollments)
			enrollments.forEach((element: { course: { slug: string } }) => {
				course.push(element.course.slug);
			});
		return course;
	}
	const { mutateAsync: createDiaryEntry } = trpc.learningDiary.createDiaryEntry.useMutation();
	const { mutateAsync: updateDiaryEntry } = trpc.learningDiary.updateDiaryEntry.useMutation();

	const { data: inputDiaryEntry } = trpc.learningDiary.getEntryForEdit.useQuery({
		entryId: diaryEntry.id
	});

	const slugs = fetchCourseSlugsByUser();
	const { data: lessonsData } = trpc.learningDiary.getLessons.useQuery({ slugs });
	const lessons: Lessons[] = [];
	if (lessonsData ?? false) {
		lessonsData?.forEach((ele: { lessonId: string; title: string }) => {
			lessons.push({ id: ele.lessonId, name: ele.title });
		});
	}
	const router = useRouter();

	async function onConfirm(entryForm: EntryFormModel) {
		if (diaryEntry.id != "") {
			try {
				const result = await updateDiaryEntry({
					id: diaryEntry.id,
					completedLessonId: entryForm.completedLessonId,
					distractions: entryForm.distractions,
					duration: entryForm.duration,
					efforts: entryForm.efforts,
					lessonId: entryForm.lessonId,
					notes: entryForm.notes
				});
				console.log(result);
				showToast({
					type: "success",
					title: "Eintrag wurde bearbeitet!",
					subtitle: ""
				});

				router.replace(router.asPath);
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle:
						"Der Eintrag konnte nicht bearbeitet werden. Siehe Konsole für mehr Informationen."
				});
			}
		} else {
			entryForm.id = null;
			try {
				const result = await createDiaryEntry(entryForm);
				showToast({
					type: "success",
					title: "Eintrag erstellt!",
					subtitle: ""
				});
				router.replace(router.asPath);
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle:
						"Der Eintrag konnte nicht erstellt werden. Siehe Konsole für mehr Informationen."
				});
			}
		}
	}
	return (
		<div>
			{!inputDiaryEntry ? (
				<EntryEditor
					onConfirm={onConfirm}
					entry={{
						id: "",
						distractions: "",
						completedLessonId: diaryEntry.completedLessonId,
						notes: "",
						duration: 0,
						efforts: "",
						lessonId: diaryEntry.lessonId,
						learningStrategies: []
					}}
					lessons={lessons}
				/>
			) : (
				<EntryEditor
					onConfirm={onConfirm}
					entry={{
						id: inputDiaryEntry.id,
						distractions: inputDiaryEntry.distractions,
						completedLessonId: inputDiaryEntry.completedLessonId,
						notes: inputDiaryEntry.notes,
						duration: inputDiaryEntry.duration,
						efforts: inputDiaryEntry.efforts,
						lessonId: inputDiaryEntry.lessonId,
						learningStrategies: diaryEntry.learningStrategies
					}}
					lessons={lessons}
				/>
			)}
		</div>
	);
}

export default function LearningDiary(props: LearningDiaryProps) {
	const [selectedEntry, setSelectedEntry] = useState("");
	const [selectedLesson, setSelectedLesson] = useState("");
	const [selectedCompletedLesson, setSelectedCompletedLesson] = useState(-1);
	function selectEntry(id: string): void {
		setSelectedEntry(id);
		setSelectedCompletedLesson(-1);
		setSelectedLesson("");
	}
	function selectCompletedLesson(lessonId: string, completedLessonId: number): void {
		setSelectedCompletedLesson(completedLessonId);
		setSelectedLesson(lessonId);
		setSelectedEntry("");
	}
	return (
		<CenteredContainerXL>
			<h1 className="mb-16 text-5xl">Mein Lerntagebuch</h1>
			<div className="mx-auto flex w-full  max-w-full flex-row justify-between gap-4">
				<TabGroupEntries
					selectEntry={selectEntry}
					selectCompletedLesson={selectCompletedLesson}
					completedLessons={props.completedLessons}
					entries={props.entries}
				/>
				<div className="border-card flex w-full flex-col gap-5 bg-white p-4">
					<Entry
						id={selectedEntry}
						diaryID={""}
						distractions={null}
						efforts={null}
						notes={null}
						completedLessonId={selectedCompletedLesson}
						completedLesson={null}
						learningStrategies={[]}
						lessonId={selectedLesson}
						createdAt={new Date()}
						lesson={null}
						duration={null}
					/>
				</div>
				<div className="flex w-full flex-col gap-5">
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
					<StrategyOverviews />
				</div>
			</div>
		</CenteredContainerXL>
	);
}
