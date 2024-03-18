import { CenteredContainer } from "@self-learning/ui/layouts";
import { CourseFormModel } from "../course-form-model";
import { IncompleteNanoModuleExport } from "@self-learning/lia-exporter";
import { useEffect, useState } from "react";
import { ErrorReportDialog } from "./error-report-dialog";
import { ExportCourseProgressDialog } from "./export-progress-dialog";

export function ExportCourseDialog({
	course,
	onClose
}: {
	course: CourseFormModel;
	onClose: () => void;
}) {
	const [errorReport, setErrorReport] = useState<IncompleteNanoModuleExport[]>([]);
	const [isFinished, setExportFinished] = useState(false);
	/*
	 * User may close dialogs when/by:
	 * - Aborting export in progress dialog, while export is still running
	 * - Closing the ErrorReportDialog
	 * - Clicking on the backdrop (only in ErrorReportDialog)
	 */
	const [userClosed, setUserClosed] = useState(false);

	useEffect(() => {
		if (userClosed || (isFinished && errorReport.length === 0)) {
			onClose();
		}
	}, [userClosed, isFinished, errorReport, onClose]);

	if (userClosed) return null;
	return (
		<CenteredContainer>
			{!isFinished && (
				<ExportCourseProgressDialog
					course={course}
					onClose={() => setUserClosed(true)}
					onFinish={() => setExportFinished(true)}
					onError={setErrorReport}
				/>
			)}
			{isFinished && errorReport.length > 0 && (
				<>
					{console.log("errorReport", errorReport)}
					<ErrorReportDialog
						report={errorReport}
						course={course}
						onClose={() => setUserClosed(true)}
					/>
				</>
			)}
		</CenteredContainer>
	);
}
