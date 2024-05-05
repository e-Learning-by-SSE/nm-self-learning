import { CenteredContainer } from "@self-learning/ui/layouts";
import React, { useState } from "react";
import { Dialog, DialogActions } from "@self-learning/ui/common";

export type ButtonActions = "OK" | "CANCEL";

export const ButtonActions = {
	OK: "OK" as ButtonActions,
	CANCEL: "CANCEL" as ButtonActions
};

export function SimpleDialog({
	children,
	name,
	size = "sm",
	onClose
}: {
	children: React.ReactNode;
	name: string;
	size?: "sm" | "md" | "lg";
	onClose: (action: ButtonActions) => void;
}) {
	const [open, setOpen] = useState(true);

	const onDialogClose = (type?: ButtonActions) => {
		setOpen(false);
		onClose(type ?? ButtonActions.CANCEL);
	};

	const getDialogSize = () => {
		switch (size) {
			case "sm":
				return { height: "25vh", width: "30vw" };
			case "md":
				return { height: "50vh", width: "50vw" };
			case "lg":
				return { height: "75vh", width: "70vw" };
			default:
				return { height: "25vh", width: "30vw" };
		}
	}


	if (!open) return null;
	return (
		<CenteredContainer>
			<Dialog
				style={getDialogSize()}
				title={name}
				onClose={() => {
					onDialogClose();
				}}
			>
				<CenteredContainer className="overflow-auto">
					<div className="overflow-auto">{children}</div>
				</CenteredContainer>
				<div
					className="dialog-actions-container"
					style={{ position: "absolute", bottom: 10, right: 10}}
				>
					<DialogActions onClose={onDialogClose}>
						<button
							className="btn-primary"
							onClick={() => onDialogClose(ButtonActions.OK)}
						>
							OK
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}
