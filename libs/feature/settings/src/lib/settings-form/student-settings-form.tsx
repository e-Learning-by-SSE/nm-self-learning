export function StudentSettingsForm({
	learningStatistics,
	hasLearningDiary,
	onChange
}: {
	learningStatistics: boolean;
	hasLearningDiary: boolean;
	onChange: (checkbox: string, value: boolean) => void;
}) {

	const onCheckboxChange = (checkbox: string, value: boolean) => {
		onChange(checkbox, value);
	};

	return (
		<div>
			<h2 className="mt-4 text-lg font-bold">Lernen</h2>
			<div className="mt-6 flex items-center gap-2">
				<input
					type={"checkbox"}
					className="checkbox"
					id="learningStatistics"
					name="learningStatistics"
					checked={learningStatistics}
					onChange={e => {
						onCheckboxChange("learningStatistics", e.target.checked);
					}}
				/>
				<label htmlFor="learningStatistics">Lernstatistiken</label>
			</div>
			<section className="mt-5 rounded-lg bg-white p-3.5">
				<span className="mt-5 h-32 w-full" title="Check this for learning statistics">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
					tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
					vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
					no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
					amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
					labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
					et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet.
				</span>
			</section>
			<div className="mt-4 flex items-center gap-2">
				<input
					type={"checkbox"}
					className="checkbox"
					id="learningDiary"
					name="learningDiary"
					checked={hasLearningDiary}
					onChange={e => {
						onCheckboxChange("hasLearningDiary", e.target.checked);
					}}
				/>
				<label htmlFor="learningDiary">Lerntagebuch</label>
			</div>
			<section className="mt-5 rounded-lg bg-white p-3.5">
				<span className="mt-5 h-32 w-full" title="Check this for learningdiary">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
					tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
					vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
					no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
					amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
					labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
					et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet.
				</span>
			</section>
		</div>
	);
}