"use strict";

module.exports = {
	index(ctx) {
		ctx.body = strapi.plugin("questions").service("myService").getWelcomeMessage();
	}
};
