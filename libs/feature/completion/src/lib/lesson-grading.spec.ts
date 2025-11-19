import "@testing-library/jest-dom";
import { calculateAverageScore, calculateQuizGrade } from "./lesson-grading";
import { PerformanceGrade } from "@self-learning/types";

describe("calculateAverageScore", () => {
	it("should return 0 when there are no attempts", () => {
		const attempts = {};
		const answers = {};
		const result = calculateAverageScore(attempts, answers);
		expect(result).toBe(0);
	});

	it("should calculate the average score correctly for single attempts", () => {
		const attempts = { q1: 1, q2: 1 };
		const answers = { q1: { type: "multiple-choice" }, q2: { type: "text" } };
		const result = calculateAverageScore(attempts, answers);
		expect(result).toBe(1);
	});

	it("should apply penalties for multiple attempts", () => {
		const attempts = { q1: 3 };
		const answers = { q1: { type: "multiple-choice" } };
		const result = calculateAverageScore(attempts, answers);
		expect(result).toBeLessThan(1);
	});

	it("should handle unknown question types with default weight", () => {
		const attempts = { q1: 2 };
		const answers = { q1: { type: "unknown" } };
		const result = calculateAverageScore(attempts, answers);
		expect(result).toBeGreaterThan(0.2);
		expect(result).toBeLessThan(1);
	});

	it("should return 0 when no valid answers are provided", () => {
		const attempts = { q1: 1 };
		const answers = {};
		const result = calculateAverageScore(attempts, answers);
		expect(result).toBe(0);
	});
});

describe("calculateQuizGrade", () => {
	it("should return 'PERFECT' for scores >= 0.99", () => {
		const result = calculateQuizGrade(0.99);
		expect(result).toBe<PerformanceGrade>("PERFECT");
	});

	it("should return 'VERY_GOOD' for scores >= 0.85 and < 0.99", () => {
		const result = calculateQuizGrade(0.85);
		expect(result).toBe<PerformanceGrade>("VERY_GOOD");
	});

	it("should return 'GOOD' for scores >= 0.7 and < 0.85", () => {
		const result = calculateQuizGrade(0.7);
		expect(result).toBe<PerformanceGrade>("GOOD");
	});

	it("should return 'SATISFACTORY' for scores >= 0.55 and < 0.7", () => {
		const result = calculateQuizGrade(0.55);
		expect(result).toBe<PerformanceGrade>("SATISFACTORY");
	});

	it("should return 'SUFFICIENT' for scores < 0.55", () => {
		const result = calculateQuizGrade(0.5);
		expect(result).toBe<PerformanceGrade>("SUFFICIENT");
	});
});
