// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Chainable<Subject> {
		/**
		 * Logs into the application using the given `username`.
		 * The login session is stored between test runs and must only be called once.
		 *
		 * @example
		 * beforeEach(() => {
		 * 	cy.login("dumbledore");
		 * 	cy.visit("/teaching/courses/edit/test-lesson");
		 * });
		 */
		login(username?: string): void;
		byTestId(id: string): Chainable<JQuery<HTMLElement>>;
	}
}
//
// -- This is a parent command --
Cypress.Commands.add("login", username => {
	cy.session([username], () => {
		cy.visit("/api/auth/signin");
		cy.get("input[name=username]").type(username ?? "potter");
		cy.get("button[type=submit]").last().click();
	});
});

Cypress.Commands.add("byTestId", id => {
	return cy.get(`[data-testid=${id}]`);
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
Cypress.Commands.overwrite("visit", (originalFn, url) => {
	originalFn(url);
	// Wait for page to be visible, otherwise we get blank screenshots
	//
});
