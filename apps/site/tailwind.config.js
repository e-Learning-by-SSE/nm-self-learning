/** @type {import("tailwindcss").Config}  */
module.exports = {
	presets: [require("../../tailwind.config.js")],
	theme: {
		extend: {
			animation: {
				// welcome screen animation
				blob: "blob 7s infinite"
			},
			keyframes: {
				blob: {
					"0%": {
						transform: "translate(0px, 0px) scale(1)"
					},
					"25%": {
						transform: "translate(-128px, -128px) scale(1.1)"
					},
					"50%": {
						transform: "translate(0px, 256px) scale(0.9)"
					},
					"75%": {
						transform: "translate(128px, 128px) scale(0.9)"
					},
					"100%": {
						transform: "translate(0px, 0px) scale(1)"
					}
				}
			}
		}
	}
};
