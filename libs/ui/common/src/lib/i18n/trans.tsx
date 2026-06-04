import { Trans as Translation, useTranslation } from "next-i18next";

/**
 * Wrapper for i18n Trans component to provide default look'n-feel for common html tags
 */
export function Trans({
	namespace,
	i18nKey,
	components,
	count,
	values
}: {
	namespace: string;
	i18nKey: string;
	components?: Record<string, React.JSX.Element>;
	count?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	values?: Record<string, any>;
}) {
	const { t } = useTranslation(namespace);

	return (
		<Translation
			t={t}
			i18nKey={i18nKey}
			count={count}
			values={values}
			components={{
				...{
					strong: <strong />,
					i: <i />,
					br: <br />,
					ul: <ul className="list-disc list-inside space-y-2 ml-6" />,
					li: <li />,
					primary: <span className="mx-1 font-semibold text-c-primary" />
				},
				...components
			}}
		/>
	);
}
