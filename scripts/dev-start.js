const { exec } = require("child_process");

// Function to execute a command and return its process
function executeCommand({ prefix = "", command }) {
	const process = exec(command);

	process.stdout.on("data", data => {
		console.log(`${prefix} ${data}`);
	});

	process.stderr.on("data", data => {
		// Red color start
		const RED = "\x1b[31m";
		// Reset color
		const RESET = "\x1b[0m";
		console.error(`${RED}stderr:${RESET} ${data}`);
	});

	process.on("close", code => {
		console.log(`process exited with code ${code}`);
	});

	return process;
}

// Function to stop the running processes
function stopProcesses(processes) {
	console.log("Stopping processes...");
	processes.forEach(proc => {
		proc.kill();
	});
	process.exit(0);
}

// Set up the Ctrl+C signal handler
process.on("SIGINT", () => {
	stopProcesses([npmStartProcess, prismaStudioProcess]);
});

// Execute commands
const npmStartProcess = executeCommand({ command: "npm start" });
const prismaStudioProcess = executeCommand({
	prefix: "prisma-studio|",
	command: "npx prisma studio --browser none"
});
