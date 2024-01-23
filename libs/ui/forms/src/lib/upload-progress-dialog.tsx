import { DialogWithReactNodeTitle, ProgressBar } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState, useEffect } from "react";

export function UploadProgressDialog({
	name,
	progress,
	onClose
}: {
	name: string;
	progress: number;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);
	useEffect(() => {
		if (progress === 0) {
			setOpen(true);
		} else if (progress === 100) {
			setOpen(false);
		}
	}, [progress]);

	if (!open) return null;
	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={<span className="text-3xl font-semibold">{name} wird hochgeladen</span>}
				onClose={() => {
					setOpen(false);
					onClose();
				}}
			>
				<ProgressBar progress={progress} />
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}
