"use client";

import React, { useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import {
	FireIcon,
	ClockIcon,
	SunIcon,
	CalendarDaysIcon,
	LightBulbIcon,
	CheckCircleIcon,
	MoonIcon,
	ChartBarIcon
} from "@heroicons/react/24/outline";

const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export function Feedback() {
	const [open, setOpen] = useState(false);

	// --- Fetch all learning and quiz-related data from backend ---
	const { data: hourlyLearning } = trpc.metrics.getStudentMetric_HourlyLearningTime.useQuery();
	const { data: dailyLearning } = trpc.metrics.getStudentMetric_DailyLearningTime.useQuery();
	const { data: hourlyQuiz } = trpc.metrics.getStudentMetric_HourlyAverageQuizAnswers.useQuery();
	const { data: streakData } = trpc.metrics.getStudentMetric_LearningStreak.useQuery();

	const recommendations = useMemo(() => {
		const recs: { icon: JSX.Element; text: string }[] = [];

		// 1️⃣ Learning streak
		const streak = streakData?.currentStreakDays ?? 0;
		if (streak > 0) {
			recs.push({
				icon: <FireIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />,
				text: `Du hast eine Lernserie von ${streak} Tagen – bleib dran!`
			});
		}

		// 2️⃣ Average daily learning time (hours + minutes)
		if (dailyLearning && dailyLearning.length > 0) {
			const avgSeconds =
				dailyLearning.reduce((a: number, b: any) => a + (b.timeSeconds ?? 0), 0) /
				dailyLearning.length;
			const hours = Math.floor(avgSeconds / 3600);
			const minutes = Math.round((avgSeconds % 3600) / 60);

			let timeStr = "";
			if (hours > 0 && minutes > 0) timeStr = `${hours} Stunden und ${minutes} Minuten`;
			else if (hours > 0) timeStr = `${hours} Stunden`;
			else timeStr = `${minutes} Minuten`;

			recs.push({
				icon: <ClockIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />,
				text: `Du lernst durchschnittlich ${timeStr} pro Tag – tolle Beständigkeit!`
			});
		}

		// 3️⃣ Preferred learning time
		if (hourlyLearning && hourlyLearning.length > 0) {
			let morning = 0,
				afternoon = 0,
				evening = 0;

			for (const e of hourlyLearning) {
				const hour = new Date(e.hour).getHours();
				if (hour < 8) morning += e.timeSeconds ?? 0;
				else if (hour < 16) afternoon += e.timeSeconds ?? 0;
				else evening += e.timeSeconds ?? 0;
			}

			const max = Math.max(morning, afternoon, evening);
			let slot = "";
			let icon: JSX.Element;

			if (max === morning) {
				slot = "am Morgen";
				icon = <SunIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
			} else if (max === afternoon) {
				slot = "am Nachmittag";
				icon = <SunIcon className="h-5 w-5 text-amber-400 flex-shrink-0" />;
			} else {
				slot = "am Abend";
				icon = <MoonIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />;
			}

			recs.push({
				icon,
				text: `Du lernst ${slot} am effektivsten – super Fokus!`
			});
		}

		// 4️⃣ Most active day
		if (dailyLearning && dailyLearning.length > 0) {
			const totals: Record<string, number> = {};
			for (const d of dailyLearning) {
				const date = new Date(d.day);
				const day = weekdays[date.getDay()];
				totals[day] = (totals[day] ?? 0) + (d.timeSeconds ?? 0);
			}
			const mostActive = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
			if (mostActive) {
				recs.push({
					icon: <CalendarDaysIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
					text: `Dein aktivster Lerntag ist der ${mostActive}.`
				});
			}
		}

		// 5️⃣ Total quiz questions answered
		if (hourlyQuiz && hourlyQuiz.length > 0) {
			const total = hourlyQuiz.reduce(
				(a: number, b: any) => a + ((b.correctAnswers ?? 0) + (b.wrongAnswers ?? 0)),
				0
			);
			if (total > 0) {
				recs.push({
					icon: <LightBulbIcon className="h-5 w-5 text-pink-500 flex-shrink-0" />,
					text: `Du hast insgesamt ${total} Quizfragen beantwortet – großartige Beteiligung!`
				});
			}
		}

		// 6️⃣ Overall quiz accuracy
		if (hourlyQuiz && hourlyQuiz.length > 0) {
			const totalCorrect = hourlyQuiz.reduce(
				(a: number, b: any) => a + (b.correctAnswers ?? 0),
				0
			);
			const totalAll = hourlyQuiz.reduce(
				(a: number, b: any) => a + ((b.correctAnswers ?? 0) + (b.wrongAnswers ?? 0)),
				0
			);
			if (totalAll > 0) {
				const acc = Math.round((totalCorrect / totalAll) * 100);
				recs.push({
					icon: <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />,
					text: `Deine Quizgenauigkeit liegt bei ${acc}% – weiter so!`
				});
			}
		}

		// 7️⃣ Quiz accuracy by time of day
		if (hourlyQuiz && hourlyQuiz.length > 0) {
			const accForSlot = (filterFn: (h: number) => boolean) => {
				const arr = hourlyQuiz.filter(q => filterFn(new Date(q.hour).getHours()));
				const total = arr.reduce(
					(a, b) => a + ((b.correctAnswers ?? 0) + (b.wrongAnswers ?? 0)),
					0
				);
				const correct = arr.reduce((a, b) => a + (b.correctAnswers ?? 0), 0);
				return total > 0 ? Math.round((correct / total) * 100) : 0;
			};

			const morning = accForSlot(h => h < 8);
			const afternoon = accForSlot(h => h >= 8 && h < 16);
			const evening = accForSlot(h => h >= 16);

			let bestSlot = "";
			let icon: JSX.Element;

			if (morning >= afternoon && morning >= evening) {
				bestSlot = "am Morgen";
				icon = <SunIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
			} else if (afternoon >= morning && afternoon >= evening) {
				bestSlot = "am Nachmittag";
				icon = <SunIcon className="h-5 w-5 text-amber-400 flex-shrink-0" />;
			} else {
				bestSlot = "am Abend";
				icon = <MoonIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />;
			}

			recs.push({
				icon,
				text: `Deine Quizleistung ist ${bestSlot} am höchsten – konzentriertes Arbeiten zahlt sich aus.`
			});
		}

		// 8️⃣ Weekly trend
		if (dailyLearning && dailyLearning.length > 14) {
			const sorted = [...dailyLearning].sort(
				(a: any, b: any) => new Date(a.day).getTime() - new Date(b.day).getTime()
			);
			const last7 = sorted.slice(-7);
			const prev7 = sorted.slice(-14, -7);
			const sum = (arr: any[]) => arr.reduce((a, b) => a + (b.timeSeconds ?? 0), 0);
			const diff = sum(last7) - sum(prev7);
			recs.push({
				icon: <ChartBarIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />,
				text:
					diff > 0
						? "Deine Lernzeit ist im Vergleich zur letzten Woche gestiegen – weiter so!"
						: "Deine Lernzeit ist im Vergleich zur letzten Woche leicht gesunken – bleib dran!"
			});
		}

		return recs;
	}, [hourlyLearning, dailyLearning, hourlyQuiz, streakData]);

	const shortList = recommendations.slice(0, 4);

	// --- Render section with modal for 'show more' functionality ---
	return (
		<div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow max-sm:p-4">
			<h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 text-center sm:text-left">
				Personalisierte Feedbacks
			</h2>

			{shortList.length === 0 ? (
				<p className="text-gray-400 text-center text-sm sm:text-base">
					Keine Daten verfügbar
				</p>
			) : (
				<ul className="space-y-3 sm:space-y-2">
					{shortList.map((r, i) => (
						<li
							key={i}
							className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base"
						>
							<div className="flex items-center gap-2">
								{r.icon}
								<span className="leading-snug">{r.text}</span>
							</div>
						</li>
					))}
				</ul>
			)}

			{recommendations.length > 4 && (
				<button
					onClick={() => setOpen(true)}
					className="text-emerald-600 text-sm sm:text-base font-medium hover:text-emerald-800 self-center mt-2 flex items-center gap-1"
				>
					Mehr Feedbacks anzeigen
					<span className="ml-1">→</span>
				</button>
			)}

			{/* Modal */}
			{open && (
				<Dialog open={true} onClose={() => setOpen(false)} className="relative z-50">
					<div
						className="fixed inset-0 bg-black/30 backdrop-blur-sm"
						aria-hidden="true"
					/>
					<div className="fixed inset-0 flex items-center justify-center p-4">
						<Dialog.Panel className="w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-xl relative">
							<h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
								Personalisierte Feedbacks
							</h2>

							<ul className="space-y-3 sm:space-y-2">
								{recommendations.map((r, i) => (
									<li
										key={i}
										className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base"
									>
										<div className="flex items-center gap-2">
											{r.icon}
											<span className="leading-snug">{r.text}</span>
										</div>
									</li>
								))}
							</ul>

							<div className="mt-6 sm:mt-8 flex justify-end">
								<button
									onClick={() => setOpen(false)}
									className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50"
								>
									Schließen
								</button>
							</div>
						</Dialog.Panel>
					</div>
				</Dialog>
			)}
		</div>
	);
}
