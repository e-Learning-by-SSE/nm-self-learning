import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { SSRConfig } from "next-i18next";
import { withTranslations } from "./withTranslation";

// mock next-i18next serverSideTranslations
jest.mock("next-i18next/serverSideTranslations", () => ({
	serverSideTranslations: jest.fn()
}));

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const sst = serverSideTranslations as jest.MockedFunction<typeof serverSideTranslations>;

function makeContext(locale?: string): GetServerSidePropsContext {
	return {
		params: {},
		query: {},
		req: {},
		res: {},
		resolvedUrl: "/test",
		locale,
		locales: locale ? [locale, "en"] : ["en"],
		defaultLocale: "en"
	} as unknown as GetServerSidePropsContext;
}

function makeTranslations(locale: string, ns: string[]): SSRConfig {
	// minimal SSRConfig shape that next-i18next returns
	return {
		_nextI18Next: {
			initialI18nStore: {},
			initialLocale: locale,
			ns,
			userConfig: {}
		}
	} as unknown as SSRConfig;
}

describe("withTranslations", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("calls serverSideTranslations with context.locale and namespaces", async () => {
		const namespaces = ["common", "home"];
		const locale = "de";
		const translations = makeTranslations(locale, namespaces);
		sst.mockResolvedValueOnce(translations);

		const gssp = withTranslations(namespaces);
		const result = await gssp(makeContext(locale));

		expect(sst).toHaveBeenCalledTimes(1);
		expect(sst).toHaveBeenCalledWith(locale, namespaces);
		expect("props" in result).toBe(true);
		if (hasProps(result)) {
			expect(result.props._nextI18Next).toBeDefined();
			if (hasI18NProps(result)) {
				expect(result.props._nextI18Next.initialLocale).toBe("de");
				expect(result.props._nextI18Next.ns).toEqual(namespaces);
			}
		}
	});

	it("falls back to 'en' when locale is undefined", async () => {
		const namespaces = ["common"];
		const translations = makeTranslations("en", namespaces);
		sst.mockResolvedValueOnce(translations);

		const gssp = withTranslations(namespaces);
		await gssp(makeContext(undefined));

		expect(sst).toHaveBeenCalledWith("en", namespaces);
	});

	test("merges handler props with translations (translations win on conflicts)", async () => {
		const namespaces = ["common"];
		const locale = "fr";
		const translations = {
			...makeTranslations(locale, namespaces),
			// pretend i18n also exposes a field we’re going to collide on
			sharedKey: "fromTranslations"
		} as unknown as SSRConfig;

		sst.mockResolvedValueOnce(translations);

		const handler = async (): Promise<
			GetServerSidePropsResult<{ a: number; sharedKey: string }>
		> => ({
			props: { a: 1, sharedKey: "fromHandler" }
		});

		const gssp = withTranslations<{ a: number }>(namespaces, handler);
		const result = await gssp(makeContext(locale));

		expect("props" in result).toBe(true);
		if (hasProps(result)) {
			expect(result.props.a).toBe(1);
			if (hasI18NProps(result) && "sharedKey" in result.props) {
				expect(result.props.sharedKey).toBe("fromTranslations");
				expect(result.props._nextI18Next.initialLocale).toBe("fr");
			} else {
				throw new Error("Missing i18n props");
			}
		}
	});

	it("should preserve redirect without modification", async () => {
		const namespaces = ["common"];
		const locale = "nl";
		const translations = makeTranslations(locale, namespaces);
		sst.mockResolvedValueOnce(translations);

		const handler = async (): Promise<GetServerSidePropsResult<object>> => ({
			redirect: { destination: "/somewhere", permanent: false }
		});

		const gssp = withTranslations(namespaces, handler);
		const result = await gssp(makeContext(locale));

		expect("redirect" in result).toBe(true);
		if (hasRedirect(result)) {
			expect(result.redirect.destination).toBe("/somewhere");
		}
		expect("props" in result).toBe(false);
	});

	it("should preserve notFound without modification", async () => {
		const namespaces = ["common"];
		const locale = "es";
		const translations = makeTranslations(locale, namespaces);
		sst.mockResolvedValueOnce(translations);

		const handler = async (): Promise<GetServerSidePropsResult<object>> => ({
			notFound: true
		});

		const gssp = withTranslations(namespaces, handler);
		const result = await gssp(makeContext(locale));

		expect("notFound" in result).toBe(true);
		if (hasNotFound(result)) {
			expect(result.notFound).toBe(true);
		}
		expect("props" in result).toBe(false);
	});
});

// Type Guards
function hasProps<P>(r: GetServerSidePropsResult<P>): r is { props: P } {
	return "props" in r;
}

function hasI18NProps(r: {
	props: object & SSRConfig;
}): r is { props: SSRConfig & { _nextI18Next: NonNullable<SSRConfig["_nextI18Next"]> } } {
	return "props" in r && "_nextI18Next" in r.props;
}

function hasRedirect<P>(
	r: GetServerSidePropsResult<P>
): r is { redirect: { destination: string; permanent: boolean } } {
	return "redirect" in r;
}

function hasNotFound<P>(r: GetServerSidePropsResult<P>): r is { notFound: true } {
	return "notFound" in r;
}
