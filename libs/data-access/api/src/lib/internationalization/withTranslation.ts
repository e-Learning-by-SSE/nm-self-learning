import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SSRConfig } from "next-i18next";

export function withTranslations<P extends {} = {}>(
	namespaces: string[],
	handler?: (
		context: GetServerSidePropsContext
	) => Promise<GetServerSidePropsResult<P>> | GetServerSidePropsResult<P>
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P & SSRConfig>> {
	return async function getServerSidePropsWithTranslations(
		context: GetServerSidePropsContext
	): Promise<GetServerSidePropsResult<P & SSRConfig>> {
		const { locale } = context;
		const translations = (await serverSideTranslations(
			locale ?? "en",
			namespaces
		)) as SSRConfig;

		if (!handler) {
			return {
				props: {
					...translations
				}
			} as GetServerSidePropsResult<P & SSRConfig>;
		}

		const result = await handler(context);

		if ("props" in result) {
			const mergedProps = {
				...result.props,
				...translations
			} as P & SSRConfig;

			return {
				...result,
				props: mergedProps
			} as GetServerSidePropsResult<P & SSRConfig>;
		}

		return result as GetServerSidePropsResult<P & SSRConfig>;
	};
}
