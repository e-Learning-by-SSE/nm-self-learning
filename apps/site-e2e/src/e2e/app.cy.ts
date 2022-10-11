describe("App", () => {
	beforeEach(() => cy.visit("/"));

	it("Should navigate to homepage", () => {
		cy.get("h1").should("contain", "SELF-le@rning");
	});
});
