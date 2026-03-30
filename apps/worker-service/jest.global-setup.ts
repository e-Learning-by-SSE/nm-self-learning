import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export default async function globalSetup() {
	// workspace root ist bei dir /code
	const distWorker = join(process.cwd(), "dist/apps/worker-service/worker-runner.js");

	if (existsSync(distWorker)) return;

	// Baut worker-service (inkl. additionalEntryPoints)
	execSync("npx nx build worker-service", {
		stdio: "inherit",
		env: { ...process.env, NODE_ENV: "test" }
	});

	if (!existsSync(distWorker)) {
		throw new Error(`Expected ${distWorker} after build, but it does not exist.`);
	}
}
