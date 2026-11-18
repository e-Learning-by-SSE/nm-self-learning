module.exports = {
	// https://www.i18next.com/overview/configuration-options#logging
	// debug: process.env.SITE_IS_DEMO_INSTANCE === "true",
	debug: false,
	i18n: {
		defaultLocale: "de" + "",
		locales: ["en", "de"]
	},

	showSupportNotice: false,

	/** To avoid issues when deploying to some paas (vercel...) */
	localePath:
		typeof window === "undefined"
			? // eslint-disable-next-line @typescript-eslint/no-require-imports
				require("path").resolve("./public/locales")
			: "./apps/site/public/locales",

	reloadOnPrerender: process.env.NODE_ENV === "development"

	/**
	 * @link https://github.com/i18next/next-i18next#6-advanced-configuration
	 */
	// saveMissing: false,
	// strictMode: true,
	// serializeConfig: false,
	// react: { useSuspense: false }
};
