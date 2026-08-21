"use client";

import { useState } from "react";
import { trpc } from "@self-learning/api-client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "next-i18next";

export function MyLearningPath() {
	const { t } = useTranslation("student-analytics");

	// Fetch subjects and courses in which the authenticated student is enrolled
	const { data: subjects, isLoading: loadingSubjects } = trpc.metrics.getSubjects.useQuery();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [showCourseDetails, setShowCourseDetails] = useState(false);

	// Early return while subject or completion data is still loading
	if (loadingSubjects) {
		return (
			<div
				id="MyLearningPathCard"
				className="w-full rounded-lg border border-light-border bg-white shadow-sm p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base"
			>
				{t("loadingPath")}
			</div>
		);
	}

	// Handle case when no subjects exist for the current user
	if (!subjects || subjects.length === 0) {
		return (
			<div
				id="MyLearningPathCard"
				className="w-full rounded-lg border border-light-border bg-white shadow-sm p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base"
			>
				{t("noSubjects")}
			</div>
		);
	}

	const subject = subjects[currentIndex];
	const totalCourses = subject.courses?.length ?? 0;
	const completedCourses =
		subject.courses?.filter(course => course.enrollments[0]?.status === "COMPLETED").length ?? 0;
	const coursesInPopover = subject.courses.slice(0, 10);
	const hiddenCourseCount = Math.max(totalCourses - coursesInPopover.length, 0);

	// Show lesson-level learning progress while retaining the completed-course count below.
	const progress =
		totalCourses > 0
			? Math.round(
					subject.courses.reduce(
						(sum, course) => sum + (course.enrollments[0]?.progress ?? 0),
						0
					) / totalCourses
				)
			: 0;

	// Circular navigation across available subjects
	const handlePrev = () => {
		setCurrentIndex(prev => (prev > 0 ? prev - 1 : subjects.length - 1));
		setShowCourseDetails(false);
	};
	const handleNext = () => {
		setCurrentIndex(prev => (prev + 1) % subjects.length);
		setShowCourseDetails(false);
	};

	// Navigate to the full subject detail page for continued learning
	const handleContinue = () => {
		const subjectSlug = subject.slug || subject.subjectId;
		if (subjectSlug) {
			// Note: This is hardcoded, consider using environment variables for the base URL
			window.location.href = `http://localhost:4200/subjects/${subjectSlug}`;
		}
	};

	return (
		<div
			id="MyLearningPathCard"
			className="w-full rounded-lg border border-light-border bg-white shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 flex flex-col"
		>
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

				<p className="text-xs font-medium text-gray-600 mb-2">
					{t("overallSubjectProgress")}
				</p>

				<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full">
					<div
						className="relative flex-1 w-full"
						onMouseEnter={() => setShowCourseDetails(true)}
						onMouseLeave={() => setShowCourseDetails(false)}
						onFocusCapture={() => setShowCourseDetails(true)}
						onBlurCapture={event => {
							if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
								setShowCourseDetails(false);
							}
						}}
					>
						<button
							type="button"
							className="block w-full rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
							aria-label={t("showCourseProgressDetails")}
							aria-describedby="course-progress-tooltip"
							onClick={() => setShowCourseDetails(true)}
						>
							<span className="block h-3 overflow-hidden rounded-full bg-gray-200">
								<span
									className="block h-3 rounded-full bg-emerald-500 transition-all duration-500"
									style={{ width: `${progress}%` }}
								/>
							</span>
						</button>

						<div
							id="course-progress-tooltip"
							role="tooltip"
							className={`absolute left-0 top-full z-50 mt-2 w-full min-w-[16rem] max-w-md rounded-lg bg-gray-800 p-3 text-white shadow-lg transition ${
								showCourseDetails
									? "visible translate-y-0 opacity-100"
									: "invisible translate-y-1 opacity-0"
							}`}
						>
							<p className="mb-2 text-xs font-semibold">{t("courseProgressDetails")}</p>
							<div className="space-y-2">
								{coursesInPopover.map(course => {
									const enrollment = course.enrollments[0];
									const courseProgress = enrollment?.progress ?? 0;
									const isCompleted = enrollment?.status === "COMPLETED";

									return (
										<div key={course.courseId} className="text-xs">
											<div className="mb-1 flex items-center justify-between gap-3">
												<span className="min-w-0 truncate" title={course.title}>
													{isCompleted && <span className="mr-1 text-emerald-300">✓</span>}
													{course.title}
												</span>
												<span className="shrink-0 font-medium">{courseProgress}%</span>
											</div>
											<div className="h-1 overflow-hidden rounded-full bg-gray-600">
												<div
													className="h-full rounded-full bg-emerald-400"
													style={{ width: `${courseProgress}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
							{hiddenCourseCount > 0 && (
								<p className="mt-2 border-t border-gray-600 pt-2 text-xs text-gray-300">
									{t("additionalCourses", { count: hiddenCourseCount })}
								</p>
							)}
						</div>
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
