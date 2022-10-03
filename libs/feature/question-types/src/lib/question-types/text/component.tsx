import { TextArea } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";

export function TextAnswer() {
	return (
		<CenteredContainer>
			<TextArea rows={12} label="Antwort" />
		</CenteredContainer>
	);
}
