import { render } from "@testing-library/react";

import FeatureLearningGoals from "./feature-learning-goals";

describe("FeatureLearningGoals", () => {
	it("should render successfully", () => {
		const { baseElement } = render(<FeatureLearningGoals />);
		expect(baseElement).toBeTruthy();
	});
});
