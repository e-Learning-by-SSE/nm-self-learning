// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require("@nrwl/next/plugins/with-nx");

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	images: {
		domains: [
			"lsf.uni-hildesheim.de",
			"staging.sse.uni-hildesheim.de",
			"localhost",
			"source.unsplash.com",
			"images.unsplash.com",
			"loremflickr.com",
			"cloudflare-ipfs.com",
			"c.pxhere.com",
			"www.pngall.com",
			"cdn.iconscout.com",
			"raw.githubusercontent.com",
			"www.publicdomainpictures.net",
			"upload.wikimedia.org",
			"static.spektrum.de",
			"c.pxhere.com",
			"pixnio.com",
			"www.kikisweb.de",
			"www.kikidan.com",
			"pxhere.com",
			"images.pexels.com",
			"www.spielundlern.de"
		]
	},
	nx: {
		// Set this to true if you would like to to use SVGR
		// See: https://github.com/gregberge/svgr
		svgr: true
	},
	basePath: process.env.NEXT_BASE_PATH || '',
	assetPrefix: process.env.NEXT_ASSET_PREFIX || '/',
	trailingSlash: Boolean(process.env.NEXT_TRAILING_SLASH) || false,
};

module.exports = withNx(nextConfig);
