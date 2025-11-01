const { withNx } = require("@nx/next");
const { withPlausibleProxy } = require("next-plausible");
const { i18n } = require("./next-i18next.config.js");

const packageJson = require("../../package.json");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
	nx: {},
	i18n,
	basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
	assetPrefix: process.env.NEXT_ASSET_PREFIX,
	trailingSlash: process.env.NEXT_TRAILING_SLASH ?? false,
	reactStrictMode: process.env.NODE_ENV === "development",
	productionBrowserSourceMaps: process.env.NODE_ENV === "development",
	experimental: { swcPlugins: [["next-superjson-plugin", {}]] },
	env: { APP_VERSION: packageJson.version },
	webpack: config => {
		// Let `?url` keep returning a file URL string.
		// Otherwise, import .svg as a React component (SVGR).
		config.module.rules.push({
			test: /\.svg$/i,
			oneOf: [
				{
					resourceQuery: /url/, // e.g. import iconUrl from './icon.svg?url'
					type: "asset/resource"
				},
				{
					issuer: /\.[jt]sx?$/,
					use: [
						{
							loader: "@svgr/webpack",
							options: {
								// so you can do: import { ReactComponent as Icon } from './icon.svg'
								exportType: "named",
								// nice-to-haves:
								svgo: true,
								svgoConfig: {
									plugins: [
										// keep the viewBox (don't let SVGO remove it)
										{
											name: "preset-default",
											params: { overrides: { removeViewBox: false } }
										},
										// drop width/height so CSS can control size
										{ name: "removeDimensions", active: true }
									]
								},
								titleProp: true,
								ref: true
							}
						}
					]
				}
			]
		});

		return config;
	}
};

module.exports = withNx(
	withPlausibleProxy({ customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_INSTANCE })(
		nextConfig
	)
);
