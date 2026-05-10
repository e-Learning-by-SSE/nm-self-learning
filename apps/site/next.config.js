/* eslint-disable @typescript-eslint/no-require-imports */
const { withNx, composePlugins } = require("@nx/next");
const { withPlausibleProxy } = require("next-plausible");
const { i18n } = require("./next-i18next.config.js");
const fs = require("fs");
const path = require("path");

function readPackageJson() {
	const candidates = [
		path.resolve(__dirname, "../../package.json"), // apps/site/next.config.js local
		path.resolve(__dirname, "../../../package.json"), // dist/apps/site/next.config.js
		path.resolve(process.cwd(), "package.json"), // if project is started from root
		path.resolve(process.cwd(), "../../package.json") // if started from dist/apps/site
	];

	const packageJsonPath = candidates.find(fs.existsSync);

	if (!packageJsonPath) {
		return { version: "unknown" };
	}

	return require(packageJsonPath);
}

const packageJson = readPackageJson();

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
	env: { APP_VERSION: packageJson.version },
	turbopack: {
		rules: {
			"*.svg": {
				loaders: [
					{
						loader: "@svgr/webpack",
						options: {
							exportType: "named", // <--- ADD THIS
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
				],
				as: "*.js"
			}
		}
	},
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

const plugins = [
	withPlausibleProxy({ customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_INSTANCE }),
	withNx
];

module.exports = composePlugins(...plugins)(nextConfig);
