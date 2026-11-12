import { useTranslation } from "next-i18next";

type LearningGoalsProps = {
	goals: (string | null | undefined)[];
	scope: "lesson" | "course";
	/** "list": plain list (lesson outline), "card": framed card (course overview) */
	variant?: "list" | "card";
};

export function LearningGoals({ goals, scope, variant = "list" }: LearningGoalsProps) {
	const { t } = useTranslation("common");
	const uniqueGoals = Array.from(
		new Set(
			goals.flatMap(goal =>
				(goal ?? "")
					.split(/\r?\n/)
					.map(line => line.trim().replace(/^[-*•]\s*/, ""))
					.filter(line => line.length > 0)
			)
		)
	);

	if (uniqueGoals.length === 0) return null;

	const headingId = `learning-goals-${scope}`;
	const heading = t(scope === "lesson" ? "Learning_Goals_Lesson" : "Learning_Goals_Course");

	if (variant === "card") {
		return (
			<section
				className="rounded-lg border border-c-border bg-white p-4"
				aria-labelledby={headingId}
			>
				<h2 id={headingId} className="mb-3 text-sm font-semibold">
					{heading}
				</h2>
				<ul className="space-y-2">
					{uniqueGoals.map(goal => (
						<li key={goal} className="flex gap-2 text-sm text-c-text">
							{/* same height as one text line, so the bullet is centered to it */}
							<span className="flex h-5 shrink-0 items-center">
								<span className="h-1.5 w-1.5 rounded-full bg-c-primary" />
							</span>
							<span>{goal}</span>
						</li>
					))}
				</ul>
			</section>
		);
	}

	return (
		<section className="flex flex-col gap-2" aria-labelledby={headingId}>
			<h2 id={headingId} className="text-sm font-medium">
				{heading}
			</h2>
			<ul className="list-disc space-y-1 pl-5 text-sm text-c-text-muted">
				{uniqueGoals.map(goal => (
					<li key={goal}>{goal}</li>
				))}
			</ul>
		</section>
	);
}
