import { Trans as Translation, useTranslation } from "next-i18next";

/**
 * Wrapper for i18n Trans component to provide default look'n-feel for common html tags
 */
export function Trans({
	namespace,
	i18nKey,
	components
}: {
	namespace: string;
	i18nKey: string;
	components?: Record<string, React.JSX.Element>;
}) {
	const { t } = useTranslation(namespace);

	return (
		<Translation
			t={t}
			i18nKey={i18nKey}
			components={{
				...{
					strong: <strong />,
					i: <i />,
					br: <br />,
					ul: <ul className="list-disc list-inside space-y-2 ml-6" />,
					li: <li />
				},
				...components
			}}
		/>
	);
}
