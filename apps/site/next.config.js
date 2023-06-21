// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require("@nrwl/next/plugins/with-nx");

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**"
			}
		]
	},
	nx: {
		// Set this to true if you would like to to use SVGR
		// See: https://github.com/gregberge/svgr
		svgr: true
	},
	basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
	assetPrefix: process.env.NEXT_ASSET_PREFIX ?? "/",
	trailingSlash: process.env.NEXT_TRAILING_SLASH ?? false
};

const plugins = [
	(config) => withNx(nextConfig),
	// enable when necessary: see "Proxy the Analytics Script" on https://www.npmjs.com/package/next-plausible/v/3.4.0
	// withPlausibleProxy({ 
	// 	subdirectory: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
	// 	scriptName: 'script',
	// 	customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_DOMAIN ?? '',
	// }),
];
module.exports = plugins.reduce((config, plugin) => plugin(config), nextConfig);