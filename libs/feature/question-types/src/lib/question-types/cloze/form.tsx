import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { Fragment, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { createCloze } from "./cloze-parser";
import { RenderGapType } from "./component";
import { Cloze } from "./schema";
import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";

export default function ClozeForm({ index }: { question: { type: Cloze["type"] }; index: number }) {
	const { control } = useFormContext<QuestionTypeForm<Cloze["question"]>>();

	const clozeText = useWatch({
		control,
		name: `quiz.questions.${index}.clozeText`
	});

	const cloze = useMemo(() => {
		return createCloze(clozeText);
	}, [clozeText]);

	const [answer, _setAnswer] = useState<string[]>([]);

	function setAnswer(index: number, value: string) {
		_setAnswer(prev => {
			const next = [...prev];
			next[index] = value;
			return next;
		});
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-8 xl:grid-cols-2">
				<LabeledField label="Lückentext">
					<Controller
						control={control}
						name={`quiz.questions.${index}.clozeText`}
						render={({ field }) => (
							<EditorField value={field.value} onChange={field.onChange} />
						)}
					/>
				</LabeledField>

				<LabeledField label="Preview">
					<pre className="prose h-full max-w-full whitespace-pre-line border border-light-border bg-white p-4 font-sans">
						{cloze.segments.map((segment, index) => (
							<Fragment key={index}>
								<ReactMarkdown
									linkTarget="_blank"
									remarkPlugins={remarkPlugins}
									rehypePlugins={rehypePlugins}
									components={{
										p(props) {
											const { ...rest } = props;
											return <span {...rest} />;
										}
									}}
								>
									{segment ?? ""}
								</ReactMarkdown>
								{cloze.gaps[index] && (
									<RenderGapType
										gap={cloze.gaps[index]}
										index={index}
										setAnswer={setAnswer}
										value={answer[index] ?? ""}
										disabled={false}
									/>
								)}
							</Fragment>
						))}
					</pre>
				</LabeledField>
			</div>

			<ul className="flex list-inside list-disc flex-col rounded-lg bg-gray-200 p-4">
				<li className="flex flex-col gap-2">
					<span className="font-semibold">Beispiele</span>
					<span className="rounded-lg bg-white p-2 font-mono">
						Das ist eine {"{T: [Textantwort]}"}. Das ist ein Textfeld{" "}
						{"{T: [Antwort, Lücke]}"} mit zwei richtigen Möglichkeiten.
					</span>
					<span className="rounded-lg bg-white p-2 font-mono">
						Das ist ein Single-Choice Feld mit {"{C: [#eins, zwei]}"}{" "}
						Antwortmöglichkeiten, aus denen ausgewählt werden muss. Falsche Antworten
						werden mit einem # gekennzeichnet.
					</span>
					<span className="rounded-lg bg-white p-2 font-mono">
						LaTeX kann verwendet werden, um mathematische Formeln und Symbole
						darzustellen. Zum Beispiel: {"$$V_{sphere} = \\frac{4}{3}\\pi r^3$$"}. Es
						kann auch in Single-Choice Feldern benutzt werden:{" "}
						{"{C: [#eins, $$V_{sphere} = \\frac{4}{3}\\pi r^3$$]}"}{" "}
					</span>
				</li>
			</ul>
		</div>
	);
}
