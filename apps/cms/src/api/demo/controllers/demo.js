"use strict";

module.exports = {
	deleteAll: async (ctx, next) => {
		if (process.env.NODE_ENV === "production") {
			ctx.status = 405;
			ctx.body = "Disabled in production.";
			return;
		}

		try {
			console.log("DELETING ALL COURSES");
			const deletedCourses = await strapi.query("api::course.course").deleteMany();

			console.log("DELETING ALL LESSONS");
			const deletedLessons = await strapi.query("api::lesson.lesson").deleteMany();

			ctx.body = {
				message: "Deleted the following entities:",
				entities: {
					courses: deletedCourses,
					lessons: deletedLessons
				}
			};
		} catch (err) {
			ctx.status = 500;
			ctx.body = err;
		}
	}
};
