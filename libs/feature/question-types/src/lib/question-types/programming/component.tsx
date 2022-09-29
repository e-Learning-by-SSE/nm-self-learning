import { EditorField } from "@self-learning/ui/forms";
import { useState } from "react";
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

export function ProgrammingAnswer() {
	const { setAnswer, answer, question } = useQuestion("programming");
	const [program, setProgram] = useState("console.log('Hello World!');");
	const [isExecuting, setIsExecuting] = useState(false);
	const [output, setOutput] = useState({
		isError: false,
		text: ""
	});

	async function runCode() {
		const execute: ExecuteRequest = {
			language: question.language,
			version: "4.2.3",
			files: [{ content: program }]
		};

		console.log("Executing code: ", execute);
		setOutput({ isError: false, text: "Executing..." });
		setIsExecuting(true);

		const res = await fetch("https://emkc.org/api/v2/piston/execute", {
			method: "POST",
			body: JSON.stringify(execute),
			headers: {
				"Content-Type": "application/json"
			}
		});

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
			let output = "";

			if (compileOutput !== "") {
				output += compileOutput + "\n" + data.run.output;
			}

			setOutput({
				isError: true,
				text: output
			});
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<EditorField
				label="Code"
				value={program}
				onChange={setProgram as any}
				language={question.language}
			/>

			<button className="btn-primary w-fit self-end" onClick={runCode} disabled={isExecuting}>
				Ausführen
			</button>

			<div className="rounded-lg bg-gray-200 p-8">
				{output.isError ? (
					<pre className="font-mono text-red-500">{output.text}</pre>
				) : (
					<pre className="font-mono">{output.text}</pre>
				)}
			</div>
		</div>
	);
}
