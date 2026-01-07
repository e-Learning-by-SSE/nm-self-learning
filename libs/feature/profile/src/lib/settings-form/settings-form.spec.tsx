import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FeatureSettingsForm } from "@self-learning/profile";
import userEvent from "@testing-library/user-event";

describe("FeatureSettingsForm", () => {
	it("should turn on both settings when statistics is turned on", async () => {
		const onChange = jest.fn();
		const initialState = {
			learningDiary: false,
			learningStatistics: false
		};
		render(<FeatureSettingsForm featureSettings={initialState} onChange={onChange} />);
		const ltbCheckbox = screen.getByTestId("ltb-toggle");
		await userEvent.click(ltbCheckbox);

		await waitFor(() => {
			expect(onChange).toHaveBeenCalledWith({
				learningDiary: true,
				learningStatistics: true
			});
		});
	});

	it("should turn off learning diary when statistics is turned off", async () => {
		const onChange = jest.fn();
		const initialState = {
			learningDiary: true,
			learningStatistics: true
		};
		render(<FeatureSettingsForm featureSettings={initialState} onChange={onChange} />);

		const statisticsCheckbox = screen.getByTestId("statistics-toggle");
		const ltbCheckbox = screen.getByTestId("ltb-toggle");

		await userEvent.click(ltbCheckbox);
		await userEvent.click(statisticsCheckbox);

		await waitFor(() => {
			expect(onChange).toHaveBeenCalledWith({
				learningDiary: false,
				learningStatistics: false
			});
		});
	});
});
