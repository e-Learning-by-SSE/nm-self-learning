import { formatTimeIntervalToString } from "@self-learning/util/common";
import { LearningDiaryPageDetail } from "../access-learning-diary";

export function DiaryPageDetails({ page }: { page: LearningDiaryPageDetail }) {
	return (
		<div className="flex w-full space-x-4 p-4">
			<div className="flex flex-shrink-0 flex-grow basis-1/6 flex-col">
				<span className="font-semibold">Datum:</span>
				<span>{page.createdAt.toString() /*TODO*/}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-2/6 flex-col">
				<span className="font-semibold">Kurs:</span>
				<span>{page.course.title}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-2/6 flex-col">
				<span className="font-semibold">Dauer:</span>
				<span>{formatTimeIntervalToString(page.learningDurationMs)}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-1/6 flex-col">
				<span className="font-semibold">Umfang:</span>
				<span>{page.scope}</span>
			</div>
		</div>
	);
}
