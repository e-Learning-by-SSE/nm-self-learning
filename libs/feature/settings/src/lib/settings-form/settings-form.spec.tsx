import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FeatureSettingsForm } from "settings";
import userEvent from "@testing-library/user-event";

describe("FeatureSettingsForm", () => {
	it("should turn on both settings when statistics is turned on", async () => {
		const onChange = jest.fn();
		const initialState = {
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};
		render(<FeatureSettingsForm featureSettings={initialState} onChange={onChange} />);
		const ltbCheckbox = screen.getByLabelText("Lerntagebuch");
		await userEvent.click(ltbCheckbox);

		await waitFor(() => {
			expect(onChange).toHaveBeenCalledWith({
				enabledFeatureLearningDiary: true,
				enabledLearningStatistics: true
			});
		});
	});

	it("should turn off learning diary when statistics is turned off", async () => {
		const onChange = jest.fn();
		const initialState = {
			enabledFeatureLearningDiary: true,
			enabledLearningStatistics: true
		};
		render(<FeatureSettingsForm featureSettings={initialState} onChange={onChange} />);

		const statisticsCheckbox = screen.getByLabelText("Lernstatistiken");
		const ltbCheckbox = screen.getByLabelText("Lerntagebuch");

		await userEvent.click(ltbCheckbox);
		await userEvent.click(statisticsCheckbox);

		await waitFor(() => {
			expect(onChange).toHaveBeenCalledWith({
				enabledFeatureLearningDiary: false,
				enabledLearningStatistics: false
			});
		});
	});
});
