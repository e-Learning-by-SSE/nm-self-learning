import { Dialog} from "@self-learning/ui/common";
import { LabeledField} from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { MarkdownViewer } from "@self-learning/ui/forms";

export function LicenseViewModal({ description, onClose }: { description: string, onClose: () => void }) {
	const [open, setOpen] = useState(true);

	if(!open) return null;
	return(
			<CenteredContainer>
				<Dialog 
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={"License Description"} onClose={() => {setOpen(false); onClose()}}>
				<CenteredContainer>
					<MarkdownViewer content={description} />
				</CenteredContainer>
				</Dialog>
			</CenteredContainer>
		);

}