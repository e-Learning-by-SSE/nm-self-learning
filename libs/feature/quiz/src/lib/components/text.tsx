import { TextArea } from "@self-learning/ui/forms";
import { BaseQuestion } from "./base-question";

export type TextQuestion = BaseQuestion & {
	type: "text";
	answers: null;
};

export function TextAnswer() {
	return <TextArea rows={12} label="Antwort" />;
}
