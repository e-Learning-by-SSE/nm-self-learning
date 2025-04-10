import type { StorybookConfig } from "@storybook/react-vite";
import { join } from "path";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";

const config: StorybookConfig = {
	stories: ["../src/lib/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: ["@storybook/addon-essentials"],
	framework: {
		name: "@storybook/react-vite",
		options: {}
	},
	docs: {
		autodocs: true
	},
	viteFinal: async config => {
		config.css = config.css || {};
		config.css.postcss = {
			plugins: [
				tailwind({
					config: join(__dirname, "../../../../tailwind.config.js")
				}),
				autoprefixer()
			]
		};
		return config;
	}
};

export default config;
