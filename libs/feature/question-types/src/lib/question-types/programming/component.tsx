import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useEffect, useState } from "react";
import { useQuestion } from "../../use-question-hook";

export type PistonFile = {
	name?: string;
	content: string;
};

export type ExecuteRequest = {
	/** The language to use for execution, must be a string and must be installed. */
	language: string;
	/** The version of the language to use for execution, must be a string containing a SemVer selector for the version or the specific version number to use. */
	version: string;
	/** An array of files containing code or other data that should be used for execution. The first file in this array is considered the main file. */
	files: PistonFile[];
	/** The text to pass as stdin to the program. Must be a string or left out. Defaults to blank string. */
	stdin?: string;
	/** The arguments to pass to the program. Must be an array or left out. Defaults to []. */
	args?: string[];
	/** The maximum time allowed for the compile stage to finish before bailing out in milliseconds. Must be a number or left out. Defaults to 10000 (10 seconds). */
	compile_timeout?: number;
	/** The maximum time allowed for the run stage to finish before bailing out in milliseconds. Must be a number or left out. Defaults to 3000 (3 seconds). */
	run_timeout?: number;
	/** The maximum amount of memory the compile stage is allowed to use in bytes. Must be a number or left out. Defaults to -1 (no limit). */
	compile_memory_limit?: number;
	/** The maximum amount of memory the run stage is allowed to use in bytes. Must be a number or left out. Defaults to -1 (no limit). */
	run_memory_limit?: number;
};

export type IncompleteExecuteRequest = Pick<ExecuteRequest, "files" | "stdin" | "args">;

export type ExecuteResponse = {
	/** Name (not alias) of the runtime used. */
	language: string;
	/** Version of the used runtime. */
	version: string;
	/** Results from the run stage. */
	run: Output;
	/** Results from the compile stage, only provided if the runtime has a compile stage */
	compile?: Output;
};

export type StdinMessage = {
	type: "data";
	stream: "stdin";
	data: string;
};

type Output = {
	stdout: string;
	stderr: string;
	output: string;
	code: number;
	signal: string;
};

type Runtime = { language: string; version: string };

async function getRuntimes(): Promise<Runtime[]> {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_PISTON_URL as string}/api/v2/piston/runtimes`
	);

	if (!res.ok) {
		throw new Error("Failed to fetch runtimes");
	}

	return res.json();
}

export function ProgrammingAnswer() {
	const { setAnswer, answer, question } = useQuestion("programming");
	const [program, setProgram] = useState(question.template);
	const [isExecuting, setIsExecuting] = useState(false);
	const [output, setOutput] = useState({
		isError: false,
		text: ""
	});

	const [version, setVersion] = useState<string | undefined>(undefined);
	useEffect(() => {
		getRuntimes().then(runtimes => {
			console.log("Available runtimes:", runtimes);
			setVersion(runtimes.find(r => r.language === question.language)?.version);
		});
	}, [question.language]);

	async function runCode() {
		const language = question.language;

		if (!version) {
			console.log(`Language ${language} is not available.`);

			setOutput({
				isError: true,
				text: `Language "${language}" is not available.\` Code execution server might be offline or language is not installed.`
			});

			return;
		}

		const execute: ExecuteRequest = {
			language,
			version,
			files: [{ content: program }]
		};

		console.log("Executing code: ", execute);
		setOutput({ isError: false, text: "Executing..." });
		setIsExecuting(true);

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_PISTON_URL as string}/api/v2/piston/execute`,
				{
					method: "POST",
					body: JSON.stringify(execute),
					headers: {
						"Content-Type": "application/json"
					}
				}
			);

			setIsExecuting(false);

			if (!res.ok) {
				console.error("Error running code");
				return;
			}

			const data = (await res.json()) as ExecuteResponse;
			console.log("ExecuteResponse", data);

			// Code ran successfully
			if (data.run.code === 0) {
				setOutput({
					isError: false,
					text: data.run.output
				});
			} else {
				const compileOutput = data.compile?.output ?? "";

				const output = compileOutput + "\n" + data.run.output;

				setOutput({
					isError: true,
					text: output
				});
			}
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<CenteredContainer>
			<div className="flex items-center justify-between rounded-t-lg bg-gray-200 p-4">
				<span className="text-xs text-light">
					{question.language} ({version ?? "not installed"})
				</span>

				<button
					className="btn w-fit rounded-lg bg-green-600 py-1 px-3 text-sm font-semibold text-white hover:bg-green-500"
					onClick={runCode}
					disabled={isExecuting}
				>
					Ausführen
				</button>
			</div>
			<div className="flex flex-wrap gap-2">
				<div className="w-full">
					<EditorField
						value={program}
						onChange={setProgram as any}
						language={question.language}
					/>
				</div>

				<LabeledField label="Ausgabe">
					<div className="flex h-fit max-h-[400px] w-full shrink-0 flex-col gap-4 rounded-lg border border-light-border bg-white">
						<div className="playlist-scroll h-full overflow-auto p-4">
							{output.text !== "" ? (
								<pre
									className={`font-mono ${output.isError ? "text-red-500" : ""}`}
								>
									{output.text}
								</pre>
							) : (
								<span className="text-light">Keine Ausgabe.</span>
							)}
						</div>
					</div>
				</LabeledField>
			</div>
		</CenteredContainer>
	);
}
