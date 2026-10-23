import { useTranslation } from "next-i18next";

type LearningGoalsProps = {
	goals: (string | null | undefined)[];
	scope: "lesson" | "course";
};

export function LearningGoals({ goals, scope }: LearningGoalsProps) {
	const { t } = useTranslation("common");
	const uniqueGoals = Array.from(
		new Set(
			goals
				.flatMap(goal =>
					(goal ?? "")
						.split(/\r?\n/)
						.map(line => line.trim().replace(/^[-*•]\s*/, ""))
						.filter(line => line.length > 0)
				)
		)
	);

	if (uniqueGoals.length === 0) return null;

	return (
		<section
			className="rounded-lg bg-c-surface-2 p-6"
			aria-labelledby={`learning-goals-${scope}`}
		>
			<h2 id={`learning-goals-${scope}`} className="heading mb-4 text-xl">
				{t(scope === "lesson" ? "Learning_Goals_Lesson" : "Learning_Goals_Course")}
			</h2>
			<ul className="list-disc space-y-2 pl-5">
				{uniqueGoals.map(goal => (
					<li key={goal}>{goal}</li>
				))}
			</ul>
		</section>
	);
}