import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FeatureSettingsForm } from "./settings-form";

describe("FeatureSettingsForm", () => {
	it("should turn on both settings when statistics is turned on", () => {
		const onClose = jest.fn();
		const initialState = {
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};
		const { getByLabelText } = render(
			<FeatureSettingsForm featureSettings={initialState} onChange={onClose} />
		);
		const ltbCheckbox = getByLabelText("Lerntagebuch");
		fireEvent.click(ltbCheckbox);

		expect(onClose).toHaveBeenCalledWith({
			enabledFeatureLearningDiary: true,
			enabledLearningStatistics: true
		});
	});

	it("should turn on statistics checkbox when learning diary is turned on", () => {
		const initialState = {
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};
		const { getByLabelText } = render(
			<FeatureSettingsForm featureSettings={initialState} onChange={jest.fn()} />
		);

		const statisticsCheckbox = getByLabelText("Lernstatistiken");
		const ltbCheckbox = getByLabelText("Lerntagebuch");

		fireEvent.click(ltbCheckbox);

		waitFor(() => {
			expect(statisticsCheckbox).toBeChecked();
			expect(ltbCheckbox).toBeChecked();
		});
	});
});
