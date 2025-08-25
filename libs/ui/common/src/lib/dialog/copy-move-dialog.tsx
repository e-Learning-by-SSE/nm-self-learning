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
	hasParent,
	onClose
}: {
	children: React.ReactNode;
	name: string;
	hasParent: boolean;
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
				style={{ height: "30vh", width: "35vw", overflow: "auto" }}
				title={name}
				onClose={() => {
					onDialogClose();
				}}
			>
				<CenteredContainer>{children}</CenteredContainer>
				<div className="">
					<DialogActions onClose={onDialogClose}>
						{hasParent ? (
							<>
								<button
									className="btn-primary"
									onClick={() => onDialogClose(CopyMoveButtonActions.COPY)}
								>
									Hinzufügen
								</button>
								<button
									className="btn-primary"
									onClick={() => onDialogClose(CopyMoveButtonActions.MOVE)}
								>
									Ersetzen
								</button>
							</>
						) : (
							<button
								className="btn-primary"
								onClick={() => onDialogClose(CopyMoveButtonActions.MOVE)}
							>
								Hinzufügen
							</button>
						)}
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}
