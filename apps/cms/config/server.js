console.log("ENV:");

console.log(`STRAPI_WEBHOOK_TOKEN: ${process.env.STRAPI_WEBHOOK_TOKEN}`);
console.log(`STRAPI_HOST: ${process.env.STRAPI_HOST}`);
console.log(`STRAPI_PORT: ${process.env.STRAPI_PORT}`);
console.log(`STRAPI_APP_KEYS: ${process.env.STRAPI_APP_KEYS}`);

module.exports = ({ env }) => ({
	host: env("HOST", process.env.STRAPI_HOST),
	port: env.int("PORT", process.env.STRAPI_PORT),
	app: {
		keys: process.env.STRAPI_APP_KEYS.split(",")
	},
	webhooks: {
		defaultHeaders: {
			Authorization: process.env.STRAPI_WEBHOOK_TOKEN
		}
	}
});
