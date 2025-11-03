import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nxPlugin from "@nx/eslint-plugin";
import pluginCypress from "eslint-plugin-cypress";

export default [
	{
		ignores: ["**/dist", "node_modules/**", "apps/site/.next/**", "apps/site/jest.config.ts"]
	},
	// Base JS rules
	js.configs.recommended,

	// TypeScript rules (non–type-aware; switch to recommendedTypeChecked if you want)
	...tseslint.configs.recommended,

	{
		files: ["**/*.{ts,tsx,cts,mts}"],
		plugins: { "@nx": nxPlugin },
		languageOptions: {
			// Add this to ensure proper TypeScript parsing
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			indent: ["off", "tab", { SwitchCase: 1 }],
			semi: "off",
			"no-empty": "off",
			"no-empty-function": "off",
			"@typescript-eslint/no-empty-function": "off",
			// If you actually need this rule, also install/enable eslint-plugin-jsx-a11y or eslint-config-next:
			// "jsx-a11y/anchor-is-valid": "off",
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_"
				}
			],
			"no-extra-semi": "error",
			"@typescript-eslint/no-non-null-assertion": "error",
			"@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }],

			// Nx rule (what the @nx preset mainly adds)
			"@nx/enforce-module-boundaries": "off"
		}
	},
	// Override for test files
	{
		files: ["**/*.spec.ts", "**/*.test.ts", "**/*.spec.tsx", "**/*.test.tsx"],
		rules: {
			"@typescript-eslint/no-non-null-assertion": "off"
		}
	},
    // Disable linting for all *.config.ts and data migration files
    {
        files: ['**/*.config.ts', 'libs/data-access/database/prisma/migrations/**/data-migration.ts'],
        rules: {
        // Turn off *everything*
        },
        ignores: true, // <- not valid
    }

	// Cypress E2E
	{
		files: ["apps/site-e2e/**/*.{cy,spec}.{ts,tsx,js,jsx}"],
		plugins: { cypress: pluginCypress },
		languageOptions: {
			globals: {
				cy: true,
				Cypress: true,
				expect: true,
				assert: true
			}
		},
		rules: {
			"cypress/no-async-tests": "error",
			"cypress/no-force": "warn",
			"cypress/assertion-before-screenshot": "warn"
		}
	}
];
