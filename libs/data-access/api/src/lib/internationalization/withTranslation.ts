import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SSRConfig } from "next-i18next";

export function withTranslations<P extends object = object>(
	namespaces: string[],
	handler: (
		context: GetServerSidePropsContext
	) => Promise<GetServerSidePropsResult<P>> | GetServerSidePropsResult<P> = async () => ({
		props: {} as P
	})
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P & SSRConfig>> {
	return async function getServerSidePropsWithTranslations(
		context: GetServerSidePropsContext
	): Promise<GetServerSidePropsResult<P & SSRConfig>> {
		const result = await handler(context);

		// Return "not found" and "redirect" results as is
		if (!("props" in result)) {
			return result;
		}

		// HOF primarily responsible for passing translations into the page
		const { locale } = context;
		const translations = (await serverSideTranslations(
			locale ?? "en",
			namespaces
		)) as SSRConfig;

		// Merge translations with the original props from the handler
		return {
			...result,
			props: {
				...result.props,
				...translations
			}
		} as GetServerSidePropsResult<P & SSRConfig>;
	};
}
