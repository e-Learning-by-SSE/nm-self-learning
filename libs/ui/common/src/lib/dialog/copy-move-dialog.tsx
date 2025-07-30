import { Dialog, DialogActions } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import React, { useState } from "react";

export type CopyMoveButtonActions = "COPY" | "MOVE" | "CANCEL";

export const CopyMoveButtonActions = {
	COPY: "COPY" as CopyMoveButtonActions,
	MOVE: "MOVE" as CopyMoveButtonActions,
	CANCEL: "CANCEL" as CopyMoveButtonActions
};

export function CopyMoveDialog({
	children,
	name,
	onClose
}: {
	children: React.ReactNode;
	name: string;
	onClose: (action: CopyMoveButtonActions) => void;
}) {
	const [open, setOpen] = useState(true);

	const onDialogClose = (type?: CopyMoveButtonActions) => {
		setOpen(false);
		onClose(type ?? CopyMoveButtonActions.CANCEL);
	};

	if (!open) return null;
	return (
		<CenteredContainer>
			<Dialog
				style={{ height: "25vh", width: "30vw", overflow: "auto" }}
				title={name}
				onClose={() => {
					onDialogClose();
				}}
			>
				<CenteredContainer>{children}</CenteredContainer>
				<div className="mt-auto">
					<DialogActions onClose={onDialogClose}>
						<button
							className="btn-primary"
							onClick={() => onDialogClose(CopyMoveButtonActions.COPY)}
						>
							Copy
						</button>
						<button
							className="btn-primary"
							onClick={() => onDialogClose(CopyMoveButtonActions.MOVE)}
						>
							Move
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}
