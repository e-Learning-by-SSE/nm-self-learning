import { TestingCommand } from "@self-learning/util/testing";

export function runCommand<C extends keyof TestingCommand>(
	command: C,
	payload: TestingCommand[C]
): void {
	cy.request("POST", "/api/testing", { command, payload });
}
