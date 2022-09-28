import { useQuestion } from "../../use-question-hook";

export function ClozeAnswer() {
	const { question } = useQuestion("cloze");

	return (
		<div className="grid items-start gap-8">
			<span className="text-slate-400">Vervollständige den nachfolgenden Text:</span>

			<div className="text-justify leading-10">
				{question.textArray.map((text, index) => (
					<span key={text}>
						{text}
						{index < question.textArray.length - 1 && (
							<input type="text" className="textfield" />
						)}
					</span>
				))}
			</div>
		</div>
	);
}
