const { randomBytes } = require("crypto");

function setGeneratedCourseId(event) {
	event.params.data.lessonId = randomBytes(4).toString("hex");
}

module.exports = {
	beforeCreate(event) {
		setGeneratedCourseId(event);
	},
	beforeUpdate(event) {
		if (event.params.data.lessonId === "tbd") {
			setGeneratedCourseId(event);
		}
	}
};
