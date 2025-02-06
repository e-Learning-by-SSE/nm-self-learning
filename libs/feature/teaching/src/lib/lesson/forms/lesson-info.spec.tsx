import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LessonInfoEditor } from "./lesson-info";
import { LessonFormModel } from "@self-learning/teaching";
import { FormProvider, useForm } from "react-hook-form";
import { SessionProvider } from "next-auth/react";

global.ResizeObserver = class {
	observe() {}

	unobserve() {}

	disconnect() {}
};

jest.mock("@self-learning/api-client", () => {
	return {
		trpc: {
			author: {
				getAll: {
					useQuery: jest.fn(() => ({ data: [] }))
				}
			},
			license: {
				getAll: {
					useQuery: jest.fn(() => ({ data: [] }))
				}
			},
			repository: {
				getRepositories: {
					useQuery: jest.fn(() => ({ data: [] }))
				}
			}
		}
	};
});

describe("lesson-info-editor", () => {
	describe("combobox-onChange", () => {
		it("should return the name of the pressed author", async () => {
			// Arrange
			const onSubmitMock = jest.fn();

			render(
				<SessionProvider session={null}>
					<FormWrapper onSubmit={onSubmitMock}>
						<LessonInfoEditor />
					</FormWrapper>
				</SessionProvider>
			);

			// Act
			const buttons = await screen.findAllByTestId("author-option");
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
