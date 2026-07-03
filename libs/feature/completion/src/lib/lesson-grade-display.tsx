import { scoreToPerformanceGrade } from "./lesson-grading";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { PerformanceGrade } from "@self-learning/types";

type Rating = number | PerformanceGrade;

function resolveGrade(rating: Rating): PerformanceGrade {
	if (typeof rating === "number") {
		return scoreToPerformanceGrade(rating);
	}
	return rating;
}

export function SmallGradeBadge({
	rating,
	sizeClassName = "min-w-[2rem] px-2 py-1"
}: {
	rating: Rating;
	sizeClassName?: string;
}) {
	const session = useRequiredSession();
	if (!session.data?.user.featureFlags.experimental) return null;

	const grade = resolveGrade(rating);

	const gradeDisplay = (() => {
		switch (grade) {
			case "PERFECT":
				return {
					text: "1+",
					className:
						"text-purple-700 bg-gradient-to-br from-purple-100 to-amber-100 border-purple-300"
				};
			case "VERY_GOOD":
				return {
					text: "1",
					className: "text-green-700 bg-green-100 border-green-300"
				};
			case "GOOD":
				return {
					text: "2",
					className: "text-blue-700 bg-blue-100 border-blue-300"
				};
			case "SATISFACTORY":
				return {
					text: "3",
					className: "text-orange-700 bg-orange-100 border-orange-300"
				};
			case "SUFFICIENT":
				return {
					text: "4",
					className: "text-red-700 bg-red-100 border-red-300"
				};
			default:
				return {
					text: "",
					className: "text-gray-700 bg-c-surface-2 border-c-border-strong"
				};
		}
	})();

	return (
		<span
			className={` rounded-md text-xs font-medium border ${sizeClassName} text-center ${gradeDisplay.className}`}
		>
			{gradeDisplay.text}
		</span>
	);
}

export function GradeBadge({
	rating,
	sizeClassName = "min-w-[120px] px-8 py-6"
}: {
	rating: Rating;
	sizeClassName?: string;
}) {
	const session = useRequiredSession();
	if (!session.data?.user.featureFlags.experimental) return null;

	const grade = resolveGrade(rating);

	const gradeData = (() => {
		switch (grade) {
			case "PERFECT":
				return {
					color: "text-purple-700 bg-gradient-to-br from-purple-100 to-amber-100 border-2 border-purple-300",
					text: "Perfekt",
					display: "1+"
				};
			case "VERY_GOOD":
				return {
					color: "text-green-700 bg-green-100 border-2 border-green-300",
					text: "Sehr gut",
					display: "1"
				};
			case "GOOD":
				return {
					color: "text-blue-700 bg-blue-100 border-2 border-blue-300",
					text: "Gut",
					display: "2"
				};
			case "SATISFACTORY":
				return {
					color: "text-orange-700 bg-orange-100 border-2 border-orange-300",
					text: "Befriedigend",
					display: "3"
				};
			case "SUFFICIENT":
				return {
					color: "text-red-700 bg-red-100 border-2 border-red-300",
					text: "Ausreichend",
					display: "4"
				};
			default:
				return {
					color: "text-gray-700 bg-c-surface-2 border-2 border-c-border-strong",
					text: "Unbekannt",
					display: "?"
				};
		}
	})();

	return (
		<div className={`${gradeData.color} rounded-xl ${sizeClassName} text-center shadow-lg`}>
			<div className="text-4xl font-bold mb-1">{gradeData.display}</div>
			<div className="text-sm font-medium">{gradeData.text}</div>
		</div>
	);
}
