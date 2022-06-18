import { QuizContent } from "@self-learning/types";
import { SectionHeader } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { Dispatch, SetStateAction } from "react";

export function QuizEditor({
	quiz,
	setQuiz
}: {
	quiz: QuizContent;
	setQuiz: Dispatch<SetStateAction<QuizContent>>;
}) {
	return (
		<section>
			<CenteredContainer className="flex flex-col">
				<SectionHeader
					title="Lernkontrolle"
					subtitle="Fragen, die Studierenden nach Bearbeitung der Lernheit angezeigt werden sollen.
					Die erfolgreiche Beantwortung der Fragen ist notwendig, um diese Lernheit
					erfolgreich abzuschließen."
				/>
			</CenteredContainer>
		</section>
	);
}
