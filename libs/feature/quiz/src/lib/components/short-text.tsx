import { Textfield } from "@self-learning/ui/forms";
import { BaseQuestion } from "./base-question";

export type ShortTextQuestion = BaseQuestion & {
	type: "short-text";
	answers: null;
};

export function ShortTextAnswer() {
	return <Textfield label="Antwort" />;
}
