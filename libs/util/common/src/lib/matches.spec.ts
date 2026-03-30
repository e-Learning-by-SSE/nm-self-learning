import { matches } from "./matches";

type Setting = {
	channel: string;
	type: string;
	enabled: boolean;
	extra?: string;
};

describe("matches", () => {
	const setting: Setting = {
		channel: "email",
		type: "weekly",
		enabled: true,
		extra: "metadata"
	};

	it("matches exact partial", () => {
		expect(matches({ channel: "email" })(setting)).toBe(true);
		expect(matches({ type: "weekly", enabled: true })(setting)).toBe(true);
	});

	it("returns false for mismatching values", () => {
		expect(matches({ channel: "sms" })(setting)).toBe(false);
		expect(matches({ enabled: false })(setting)).toBe(false);
	});

	it("matches empty partial (always true)", () => {
		expect(matches({})(setting)).toBe(true);
	});

	it("ignores extra keys in full object", () => {
		expect(matches({ channel: "email", type: "weekly" })(setting)).toBe(true);
	});

	it("handles full match", () => {
		const fullMatch: Setting = {
			channel: "email",
			type: "weekly",
			enabled: true,
			extra: "metadata"
		};

		expect(matches<Setting>(fullMatch)(setting)).toBe(true);
	});
});
