import { CenteredContainer } from "@self-learning/ui/layouts";
import { IncompleteNanoModuleExport } from "@self-learning/lia-exporter";
import { useState } from "react";
import { ErrorReportDialog } from "./error-report-dialog";
import { ExportCourseProgressDialog } from "./export-progress-dialog";

export type CourseExportType = {
	slug: string;
	imgUrl: string | null;
	title: string;
	specializations: {
		title: string;
	}[];
	courseId: string;
};

export function ExportCourseDialog({
	course,
	onClose
}: {
	course: CourseExportType;
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

	if (userClosed || (isFinished && errorReport.length === 0)) {
		onClose();
	}

	console.log("errorReport", errorReport);
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
				<ErrorReportDialog
					report={errorReport}
					course={course}
					onClose={() => setUserClosed(true)}
				/>
			)}
		</CenteredContainer>
	);
}
