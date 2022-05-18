const { randomBytes } = require("crypto");

function setGeneratedId(event) {
	event.params.data.competenceId = randomBytes(4).toString("hex");
}

module.exports = {
	beforeCreate(event) {
		setGeneratedId(event);
	},
	beforeUpdate(event) {
		if (event.params.data.competenceId === "tbd") {
			setGeneratedId(event);
		}
	}
};
