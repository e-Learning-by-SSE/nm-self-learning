module.exports = {
	// https://www.i18next.com/overview/configuration-options#logging
	// debug: process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true",
	debug: false,
	i18n: {
		defaultLocale: "de" + "",
		locales: ["en", "de"]
	},

	/** To avoid issues when deploying to some paas (vercel...) */
	localePath:
		typeof window === "undefined"
			? // eslint-disable-next-line @typescript-eslint/no-require-imports
				require("path").resolve("./public/locales")
			: "./apps/site/public/locales",

	reloadOnPrerender: process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true"

	/**
	 * @link https://github.com/i18next/next-i18next#6-advanced-configuration
	 */
	// saveMissing: false,
	// strictMode: true,
	// serializeConfig: false,
	// react: { useSuspense: false }
};
