import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FeatureSettingsForm } from "./settings-form";

describe("FeatureSettingsForm", () => {
	it("should turn on both settings when statistics is turned on", () => {
		const onChange = jest.fn();
		const initialState = {
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};
		const { getByLabelText } = render(
			<FeatureSettingsForm featureSettings={initialState} onChange={onChange} />
		);
		const ltbCheckbox = getByLabelText("Lerntagebuch");
		const statisticsCheckbox = getByLabelText("Lernstatistiken");
		fireEvent.click(ltbCheckbox);

		waitFor(() => {
			expect(statisticsCheckbox).toBeChecked();
			expect(ltbCheckbox).toBeChecked();
			expect(onChange).toHaveBeenCalledWith({
				enabledFeatureLearningDiary: true,
				enabledLearningStatistics: true
			});
		});
	});

	it("should turn off learning diary when statistics is turned off", () => {
		const onChange = jest.fn();
		const initialState = {
			enabledFeatureLearningDiary: true,
			enabledLearningStatistics: true
		};
		const { getByLabelText } = render(
			<FeatureSettingsForm featureSettings={initialState} onChange={onChange} />
		);

		const statisticsCheckbox = getByLabelText("Lernstatistiken");
		const ltbCheckbox = getByLabelText("Lerntagebuch");

		fireEvent.click(ltbCheckbox);

		waitFor(() => {
			expect(statisticsCheckbox).not.toBeChecked();
			expect(ltbCheckbox).not.toBeChecked();
			expect(onChange).toHaveBeenCalledWith({
				enabledFeatureLearningDiary: false,
				enabledLearningStatistics: false
			});
		});
	});
});
