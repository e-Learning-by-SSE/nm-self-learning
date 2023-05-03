import { DialogWithReactNodeTitle } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { MarkdownViewer } from "@self-learning/ui/forms";
import { ImageOrPlaceholder } from "@self-learning/ui/common";


export function LicenseViewModal({ description, name, logoUrl, onClose }: { description: string, name: string, logoUrl: string, onClose: () => void }) {
	const [open, setOpen] = useState(true);

	if(!open) return null;
	return(
			<CenteredContainer>
				<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={
					<LicenseViewHeader name={name} logoUrl={logoUrl}/>
				} onClose={() => {setOpen(false); onClose()}}>
				<CenteredContainer>
					<MarkdownViewer content={description} />
				</CenteredContainer>
				</DialogWithReactNodeTitle>
			</CenteredContainer>
		);

}

export function LicenseViewHeader({name, logoUrl} : {name: string, logoUrl: string}) {
	return(
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<ImageOrPlaceholder
					src={logoUrl ?? undefined}
					className="m-0 h-10 w-10 rounded-lg object-cover"
				/>
				<span className="text-3xl font-semibold">{name}</span>
			</div>
		</div>
	)
}
