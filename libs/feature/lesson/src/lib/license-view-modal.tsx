import { DialogWithReactNodeTitle } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState, useEffect } from "react";
import { MarkdownViewer } from "@self-learning/ui/forms";
import { ImageOrPlaceholder } from "@self-learning/ui/common";

export function LicenseViewModal({
	description,
	name,
	logoUrl,
	onClose
}: {
	description: string;
	name: string;
	logoUrl: string;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);

	if (!open) return null;
	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={<LicenseViewHeader name={name} logoUrl={logoUrl} />}
				onClose={() => {
					setOpen(false);
					onClose();
				}}
			>
				<CenteredContainer>
					<MarkdownViewer content={description} />
				</CenteredContainer>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}

export function LicenseViewHeader({ name, logoUrl }: { name: string; logoUrl: string }) {
	const [isSquare, setSquare] = useState<boolean>(true);

	useEffect(() => {
		if (logoUrl === undefined || logoUrl === null) {
			setSquare(true);
		}
		const img = new Image();
		img.onload = () => {
			if (img.width !== img.height) {
				setSquare(false);
			} else {
				setSquare(true);
			}
		};
		img.src = logoUrl ?? "";
	}, [logoUrl]);

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<ImageOrPlaceholder
					src={logoUrl ?? undefined}
					className={`m-0 h-10 ${isSquare ? "w-10" : "w-30"} rounded-lg object-cover`}
				/>
				<span className="text-3xl font-semibold">{name}</span>
			</div>
		</div>
	);
}
