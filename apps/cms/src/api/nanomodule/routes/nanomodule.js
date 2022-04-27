"use strict";

/**
 * nanomodule router.
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::nanomodule.nanomodule");
