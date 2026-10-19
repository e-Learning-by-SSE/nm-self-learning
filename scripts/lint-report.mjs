import { spawnSync } from "node:child_process";
import console from "node:console";
import { closeSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const require = createRequire(import.meta.url);
const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));
const reportDir = join(workspaceRoot, "output/lint");
const reportFile = join(reportDir, "eslint.json");
const checkstyleFile = join(reportDir, "eslint.xml");
const reportOnly = process.argv.slice(2).includes("--report-only");

function nx(args, stdout = "inherit") {
	const result = spawnSync(process.execPath, [require.resolve("nx/bin/nx.js"), ...args], {
		cwd: workspaceRoot,
		env: { ...process.env, NX_DAEMON: "false", NX_TUI: "false" },
		stdio: ["ignore", stdout, "inherit"]
	});
	if (result.error) throw result.error;
	if (result.signal) throw new Error(`Nx was terminated by ${result.signal}.`);
	return result;
}

function xmlAttribute(value) {
	return String(value).replace(
		/[&<>"'\n\r\t]/g,
		character =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&apos;",
				"\n": "&#10;",
				"\r": "&#13;",
				"\t": "&#9;"
			})[character]
	);
}

try {
	// Remove previous results before discovery, so Jenkins cannot publish a stale report.
	rmSync(reportDir, { recursive: true, force: true });
	mkdirSync(join(reportDir, "projects"), { recursive: true });
	const projectList = join(reportDir, "projects.json");
	const projectListFd = openSync(projectList, "w");
	try {
		const discovery = nx(["show", "projects", "--with-target=lint", "--json"], projectListFd);
		if (discovery.status !== 0) throw new Error("Could not discover Nx lint projects.");
	} finally {
		closeSync(projectListFd);
	}
	const projects = JSON.parse(readFileSync(projectList, "utf8")).sort();
	const results = [];
	let executionFailed = false;
	for (const project of projects) {
		// Scoped project names create subdirectories, e.g. @self-learning/worker-api.json.
		const projectFile = join(reportDir, "projects", `${project}.json`);
		try {
			const lint = nx([
				"run",
				`${project}:lint`,
				"--format=json",
				`--outputFile=${relative(workspaceRoot, projectFile)}`,
				"--fix=false",
				"--errorOnUnmatchedPattern=false",
				"--skip-nx-cache",
				"--outputStyle=static"
			]);
			const projectResults = JSON.parse(readFileSync(projectFile, "utf8"));
			if (!Array.isArray(projectResults)) throw new Error("Expected an ESLint result array.");
			results.push(...projectResults);
			const projectErrors = projectResults.reduce(
				(sum, result) => sum + result.errorCount,
				0
			);
			if (lint.status !== 0 && (lint.status !== 1 || projectErrors === 0)) {
				throw new Error(`Nx failed with exit code ${lint.status}.`);
			}
		} catch (error) {
			console.error(`Lint report for ${project} failed: ${error.message}`);
			executionFailed = true;
		}
	}

	// Relative paths let Jenkins resolve sources even when lint ran inside Docker.
	for (const result of results) {
		result.filePath = relative(workspaceRoot, result.filePath).split("\\").join("/");
	}
	const errors = results.reduce((sum, result) => sum + result.errorCount, 0);
	const warnings = results.reduce((sum, result) => sum + result.warningCount, 0);
	writeFileSync(reportFile, `${JSON.stringify(results, null, 2)}\n`);
	// The Jenkins esLint parser expects Checkstyle XML. ESLint 9 provides JSON natively.
	const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<checkstyle version="4.3">'];
	for (const result of results) {
		xml.push(`  <file name="${xmlAttribute(result.filePath)}">`);
		for (const message of result.messages) {
			xml.push(
				`    <error line="${message.line ?? 0}" column="${message.column ?? 0}" severity="${message.severity === 2 ? "error" : "warning"}" message="${xmlAttribute(message.message)}" source="${xmlAttribute(`eslint.rules.${message.ruleId ?? "parse-error"}`)}"/>`
			);
		}
		xml.push("  </file>");
	}
	xml.push("</checkstyle>");
	writeFileSync(checkstyleFile, `${xml.join("\n")}\n`);
	console.log(
		`\nESLint: ${projects.length} projects, ${results.length} files, ${errors} errors, ${warnings} warnings.\nReports: ${checkstyleFile}, ${reportFile}`
	);
	process.exitCode = executionFailed ? 2 : errors > 0 && !reportOnly ? 1 : 0;
} catch (error) {
	console.error(`Lint report failed: ${error.message}`);
	process.exitCode = 2;
}
