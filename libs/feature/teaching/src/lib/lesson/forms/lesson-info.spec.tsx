jest.mock("@self-learning/api-client", () => ({
	trpc: {
		author: {
			getAll: {
				useQuery: jest.fn(() => ({
					data: [
						{
							username: "mmuster",
							displayName: "Max Mustermann",
							slug: "muster-mann",
							imgUrl: null
						}
					]
				}))
			}
		},
		skill: {
			getRepositories: {
				useQuery: jest.fn(() => ({ data: [] }))
			}
		},
		licenseRouter: {
			getAll: {
				useQuery: jest.fn(() => ({
					data: [
						{
							name: "Uni Hi Intern",
							licenseText:
								"Nur für die interne Verwendung an der Universität Hildesheim (Moodle, Selflernplattform, Handreichungen) erlaubt. Weitere Verwendung, Anpassung und Verbreitung sind nicht gestattet.",
							oerCompatible: false,
							selectable: true
						}
					]
				}))
			}
		}
	}
}));

jest.mock("@self-learning/teaching", () => ({
	LicenseForm: () => <div data-testid="license-form-mock" />
}));

jest.mock("next-auth/react", () => ({
	...jest.requireActual("next-auth/react"),
	signIn: jest.fn(() => Promise.resolve()),
	signOut: jest.fn(() => Promise.resolve()),
	getProviders: jest.fn(() => Promise.resolve({}))
}));

/* eslint-disable import/first */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LessonInfoEditor } from "./lesson-info";
import { LessonFormModel, LicenseForm } from "@self-learning/teaching";
import { FormProvider, useForm } from "react-hook-form";
import { SessionProvider } from "next-auth/react";

describe("lesson-info-editor", () => {
	beforeAll(() => {
		// Provide a no-op ResizeObserver so it doesn't crash in jsdom
		global.ResizeObserver = class {
			observe() {}

			unobserve() {}

			disconnect() {}
		};
	});

	describe("combobox-onChange", () => {
		it("should not submit form when pressing non submit button", async () => {
			// Arrange
			const onSubmitMock = jest.fn();

			render(
				<SessionProvider session={null}>
					<FormWrapper onSubmit={onSubmitMock}>
						<LessonInfoEditor />
					</FormWrapper>
				</SessionProvider>
			);

			render(<LicenseForm />);

			// Act
			const buttons = await screen.findAllByTestId("gray-border-button");
			for (const button of buttons) {
				await userEvent.click(button);
			}

			// Assert
			expect(onSubmitMock).toHaveBeenCalledTimes(0);
		});
	});
});

function FormWrapper({
	onSubmit,
	children
}: {
	onSubmit: (data: LessonFormModel) => void;
	children: React.ReactNode;
}) {
	const methods = useForm<LessonFormModel>();

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
		</FormProvider>
	);
}
