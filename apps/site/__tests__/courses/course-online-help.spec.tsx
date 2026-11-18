import { getServerSideProps } from "../../pages/courses/[courseSlug]";
import { createMockContext } from "../context-utils";
import { getCourseData, getCourseLearningGoals } from "@self-learning/course";

jest.mock("@self-learning/api", () => ({
	withTranslations: (_namespaces: string[], handler: unknown) => handler
}));
jest.mock("@self-learning/util/auth/server", () => ({
	withAuth: (handler: unknown) => handler,
	authOptions: {}
}));
jest.mock("next-auth", () => ({ getServerSession: jest.fn().mockResolvedValue(null) }));
jest.mock("@self-learning/database/server", () => ({
	database: { lesson: { findMany: jest.fn().mockResolvedValue([]) } }
}));
jest.mock("@self-learning/ui/notifications/server", () => ({
	handleEmailTracking: jest.fn().mockResolvedValue({ shouldRedirect: false })
}));
jest.mock("@self-learning/course", () => ({
	getCourseData: jest.fn(),
	getCourseLearningGoals: jest.fn().mockResolvedValue([])
}));
jest.mock("@self-learning/ai-tutor", () => ({ I18N_NAMESPACE: [] }));
jest.mock("@self-learning/markdown", () => ({}));

describe("course online help server props", () => {
	const originalBaseUrl = process.env.SITE_ONLINE_HELP_BASE_URL;
	const originalLanguages = process.env.SITE_ONLINE_HELP_LANGUAGES;
	const context = createMockContext({ params: { courseSlug: "course" } });

	beforeEach(() => {
		(getCourseData as jest.Mock).mockResolvedValue({
			content: [],
			description: null,
			isStale: false,
			isGenerated: false
		});
		(getCourseLearningGoals as jest.Mock).mockResolvedValue([]);
	});

	afterAll(() => {
		if (originalBaseUrl === undefined) delete process.env.SITE_ONLINE_HELP_BASE_URL;
		else process.env.SITE_ONLINE_HELP_BASE_URL = originalBaseUrl;
		if (originalLanguages === undefined) delete process.env.SITE_ONLINE_HELP_LANGUAGES;
		else process.env.SITE_ONLINE_HELP_LANGUAGES = originalLanguages;
	});

	it("reads configuration for each request and serializes missing values", async () => {
		delete process.env.SITE_ONLINE_HELP_BASE_URL;
		delete process.env.SITE_ONLINE_HELP_LANGUAGES;
		const missing = await getServerSideProps(context);
		expect(missing).toMatchObject({
			props: { onlineHelp: { baseUrl: null, languages: null } }
		});

		process.env.SITE_ONLINE_HELP_BASE_URL = "https://help.example";
		process.env.SITE_ONLINE_HELP_LANGUAGES = "de,en";
		const configured = await getServerSideProps(context);
		expect(configured).toMatchObject({
			props: { onlineHelp: { baseUrl: "https://help.example", languages: "de,en" } }
		});
		expect(JSON.parse(JSON.stringify(configured))).toEqual(configured);
	});
});
