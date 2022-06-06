module.exports = {
	routes: [
		{
			method: "DELETE",
			path: "/demo/delete-all",
			handler: "demo.deleteAll",
			config: {
				auth: false
			}
		}
	]
};
