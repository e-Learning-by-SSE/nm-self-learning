import { DialogWithReactNodeTitle, ProgressBar } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";

/**
 * Dialog that indicates the progress of a file upload.
 * @param name The name of the file that is currently uploaded
 * @param progress The progress in percent of the file upload
 * (0 = not started (opens the dialog); 100 = finished (closes the dialog))
 * @param onClose A function that is called when the dialog is closed (e.g. external setState function to close the dialog)
 * @returns A dialog visualizing the progress of the file upload
 */
export function UploadProgressDialog({ name, progress }: { name: string; progress: number }) {
	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "20vh", width: "40vw", overflow: "auto" }}
				title={<span className="text-3xl font-semibold">{name} wird hochgeladen</span>}
				// This makes the dialog modal (i.e. the user cannot click outside of the dialog to close it)
				onClose={() => {}}
			>
				<ProgressBar text={`${progress}%`} progressPercentage={progress} />
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}
