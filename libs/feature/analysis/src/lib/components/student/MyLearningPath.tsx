"use client";

import { useState } from "react";
import { trpc } from "@self-learning/api-client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "next-i18next";

export function MyLearningPath() {
	const { t } = useTranslation("student-analytics");

	// Fetch learning subjects and completion stats for the authenticated student
	const { data: subjects, isLoading: loadingSubjects } = trpc.metrics.getSubjects.useQuery();
	const { data: completed, isLoading: loadingCompleted } =
		trpc.metrics.getStudentMetric_CoursesCompletedBySubject.useQuery();

	const [currentIndex, setCurrentIndex] = useState(0);

	// Early return while subject or completion data is still loading
	if (loadingSubjects || loadingCompleted) {
		return (
			<div className="w-full rounded-lg border border-light-border bg-white shadow-sm p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
				{t("loadingPath")}
			</div>
		);
	}

	// Handle case when no subjects exist for the current user
	if (!subjects || subjects.length === 0) {
		return (
			<div className="w-full rounded-lg border border-light-border bg-white shadow-sm p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
				{t("noSubjects")}
			</div>
		);
	}

	const subject = subjects[currentIndex];
	const completedInfo = completed?.find(
		(c: { subjectId: string }) => c.subjectId === subject.subjectId
	);

	const totalCourses = subject.courses?.length ?? 0;
	const completedCourses = completedInfo?.completedCoursesCount ?? 0;

	// Compute completion progress for the currently viewed subject
	const progress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

	// Circular navigation across available subjects
	const handlePrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : subjects.length - 1));
	const handleNext = () => setCurrentIndex(prev => (prev + 1) % subjects.length);

	// Navigate to the full subject detail page for continued learning
	const handleContinue = () => {
		const subjectSlug = subject.slug || subject.subjectId;
		if (subjectSlug) {
			// Note: This is hardcoded, consider using environment variables for the base URL
			window.location.href = `http://localhost:4200/subjects/${subjectSlug}`;
		}
	};

	return (
		<div className="w-full rounded-lg border border-light-border bg-white shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 flex flex-col">
			{/* Header: section title and subject navigation controls */}
			<div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3 sm:gap-0">
				{/* Changed: Standardized font size and alignment */}
				<h2 className="text-xl font-semibold text-gray-800 text-left">
					{t("learningPathTitle")}
				</h2>
				<div className="flex items-center gap-2">
					<button
						onClick={handlePrev}
						className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition"
						aria-label={t("previousSubject")}
					>
						<ChevronLeftIcon className="h-5 w-5 text-gray-600" />
					</button>
					<button
						onClick={handleNext}
						className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition"
						aria-label={t("nextSubject")}
					>
						<ChevronRightIcon className="h-5 w-5 text-gray-600" />
					</button>
				</div>
			</div>

			{/* Displays the current subject with its progress overview */}
			<div className="flex-grow">
				<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center sm:text-left">
					{t("subject")}:{" "}
					<span className="font-medium text-gray-800">{subject.title}</span>
				</p>

				<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full">
					<div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden w-full">
						<div
							className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
							style={{ width: `${progress}%` }}
						></div>
					</div>
					<span className="text-xs sm:text-sm font-medium text-gray-700 text-right sm:w-10">
						{progress}%
					</span>
				</div>

				<p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
					{completedCourses} {t("of")} {totalCourses} {t("coursesCompleted")}
				</p>
			</div>

			{/* Call-to-action for resuming learning in the selected subject */}
			<div className="mt-auto pt-4 sm:pt-6 flex justify-center sm:justify-start">
				<button
					onClick={handleContinue}
					className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-md shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
				>
					{t("continueLearning")}
				</button>
			</div>
		</div>
	);
}
