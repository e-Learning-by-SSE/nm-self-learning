import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	preserveOrder: false
});

const builder = new XMLBuilder({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	format: true,
	suppressEmptyNode: false
});

const asArray = value => (value == null ? [] : Array.isArray(value) ? value : [value]);

function getProjectName(filename) {
	const parts = filename.replaceAll("\\", "/").split("/");

	if (parts[0] === "apps" && parts.length >= 2) {
		return parts[1];
	}

	if (parts[0] === "libs" && parts.length >= 3) {
		return `${parts[1]}-${parts[2]}`;
	}

	return null;
}

for (const reportPath of process.argv.slice(2)) {
	const xml = fs.readFileSync(reportPath, "utf8");
	const data = parser.parse(xml);

	const packages = asArray(data.coverage?.packages?.package);
	const grouped = new Map();

	for (const pkg of packages) {
		for (const cls of asArray(pkg.classes?.class)) {
			const filename = cls["@_filename"] ?? "";
			const project = getProjectName(filename);

			if (!project) {
				console.warn(`Unknown project for ${filename}`);
				continue;
			}

			if (!grouped.has(project)) {
				grouped.set(project, {
					...pkg,
					"@_name": project,
					classes: { class: [] }
				});
			}

			grouped.get(project).classes.class.push(cls);
		}
	}

	if (grouped.size === 0) {
		console.warn(`No projects found in ${reportPath}`);
		continue;
	}

	data.coverage.packages.package = [...grouped.values()];

	const normalizedXml =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<!DOCTYPE coverage SYSTEM "http://cobertura.sourceforge.net/xml/coverage-04.dtd">\n' +
		builder.build(data);

	fs.writeFileSync(reportPath, normalizedXml);

	console.log(`Normalized ${path.basename(reportPath)}: ` + [...grouped.keys()].join(", "));
}
