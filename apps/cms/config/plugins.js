module.exports = {
	search: {
		enabled: true,
		config: {
			provider: "algolia",
			providerOptions: {
				apiKey: process.env.ALGOLIA_ADMIN_API_KEY,
				applicationId: process.env.ALGOLIA_APPLICATION_ID
			},
			contentTypes: [
				{
					name: "api::nanomodule.nanomodule",
					index: "nanomodules",
					fields: ["title", "subtitle", "description", "meta.tags", "authors", "image"]
				}
			]
		}
	},

	questions: {
		enabled: true,
		resolve: "./src/plugins/questions"
	}
};
