'use strict';

/**
 * nanomodule service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::nanomodule.nanomodule');
