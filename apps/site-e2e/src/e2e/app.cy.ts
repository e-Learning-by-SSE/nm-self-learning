describe("site", () => {
	beforeEach(() => cy.visit("/"));

	it("Should navigate to homepage", () => {
		cy.get("h1").contains("SELF-le@rning");
	});
});
