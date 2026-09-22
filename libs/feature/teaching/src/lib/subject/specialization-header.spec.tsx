/** @jest-environment node */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SpecializationHeader } from "./specialization-header";

jest.mock("next-i18next", () => ({
	useTranslation: () => ({ t: () => "Bearbeiten" })
}));
jest.mock("next/link", () => ({
	__esModule: true,
	default: ({ href, children, ...props }: React.PropsWithChildren<{ href: string }>) =>
		createElement("a", { href, ...props }, children)
}));
jest.mock("next/image", () => ({
	__esModule: true,
	default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt })
}));
jest.mock("@self-learning/ui/layouts", () =>
	jest.requireActual("../../../../../ui/layouts/src/lib/topic-header/topic-header")
);

describe("SpecializationHeader", () => {
	const specialization = {
		specializationId: "spec-id",
		subjectId: "subject-id",
		title: "Algebra",
		subtitle: "Algebra description",
		imgUrlBanner: "/banner.png",
		subject: { title: "Mathematik" }
	};

	it.each(["/subjects/mathematik", "/teaching/subjects/subject-id"])(
		"renders the shared header and edit destination with parent %s",
		parentLink => {
			const html = renderToStaticMarkup(
				<SpecializationHeader
					specialization={specialization}
					parentLink={parentLink}
					canEdit
				/>
			);
			expect(html).toContain(`href="${parentLink}"`);
			expect(html).toContain("Mathematik");
			expect(html).toContain("Algebra description");
			expect(html).toContain('src="/banner.png"');
			expect(html).toContain('href="/teaching/subjects/subject-id/spec-id/edit"');
			expect(html).toContain("Bearbeiten");
		}
	);

	it("hides Edit when the caller denies editing", () => {
		const html = renderToStaticMarkup(
			<SpecializationHeader
				specialization={specialization}
				parentLink="/subjects/mathematik"
				canEdit={false}
			/>
		);
		expect(html).toContain("Mathematik");
		expect(html).not.toContain("Bearbeiten");
		expect(html).not.toContain("/edit");
	});
});
