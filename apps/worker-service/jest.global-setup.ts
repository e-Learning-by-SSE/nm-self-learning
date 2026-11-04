import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export default async function globalSetup() {
	const workspaceRoot = join(__dirname, "../..");
	const distWorker = join(workspaceRoot, "dist/apps/worker-service/worker-runner.js");

	if (existsSync(distWorker)) return;

	// Baut worker-service (inkl. additionalEntryPoints)
	execSync("npx nx build worker-service", {
		cwd: workspaceRoot,
		stdio: "inherit",
		env: { ...process.env, NODE_ENV: "test" }
	});

	if (!existsSync(distWorker)) {
		throw new Error(`Expected ${distWorker} after build, but it does not exist.`);
	}
}
