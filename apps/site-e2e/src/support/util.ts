import { TestingCommand } from "@self-learning/util/testing";

export function runCommand(command: TestingCommand): void {
	cy.request("POST", "/api/testing", command);
}
