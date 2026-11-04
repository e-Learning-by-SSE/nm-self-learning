import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { XMLValidator } from "fast-xml-parser";

let errors = 0;

for (const file of process.argv.slice(2)) {
	try {
		const name = path.basename(file);
		let project;

		if (name.startsWith("libs_coverage_libs_database_")) {
			project = "data-access-database";
		} else if (name.startsWith("libs_util_markdown_")) {
			project = "util-markdown";
		} else {
			const match = name.match(/^(?:coverage_)?(apps|libs)_(.+?)_cobertura-coverage\.xml$/);
			if (match) {
				const parts = match[2].split("_");
				project = (match[1] === "apps" ? parts.slice(0, 1) : parts.slice(0, 2)).join("-");
			}
		}

		if (!project) {
			throw new Error(`Cannot determine project: ${name}`);
		}

		const xml = fs.readFileSync(file, "utf8");
		const original = XMLValidator.validate(xml);
		if (original !== true) {
			throw new Error(`Invalid original XML: ${JSON.stringify(original.err)}`);
		}

		const normalized = xml.replace(
			/(<package\b[^>]*\bname=")[^"]*(")/g,
			(_, prefix, suffix) => `${prefix}${project}${suffix}`
		);

		const result = XMLValidator.validate(normalized);
		if (result !== true) {
			throw new Error(`Invalid normalized XML: ${JSON.stringify(result.err)}`);
		}

		fs.writeFileSync(file, normalized);
		console.log(`Normalized ${name}: ${project}`);
	} catch (error) {
		console.error(`ERROR in ${file}: ${error.message}`);
		errors++;
	}
}

if (errors > 0) process.exitCode = 1;
