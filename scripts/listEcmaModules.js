/**
 * This script lists all ECMAScript modules in the node_modules directory.
 * It writes the result to a file named ecmaModules.json.
 *
 * This script was created since Jest does not support ECMAScript modules, and we
 * need to ignore the transformation of ECMAScript modules in the Jest configuration.
 *
 * To use this script, you need to run it in the root directory of the project.
 * Copy the output into the transformIgnorePatterns array in the Jest configuration. (jest.preset.js)
 */

const fs = require("fs");
const path = require("path");

// Get the path to the node_modules directory
const nodeModulesPath = path.resolve("node_modules");

// Helper function to check if a directory has a package.json file
const hasPackageJson = dir => fs.existsSync(path.join(dir, "package.json"));

// Function to check if the package uses ECMAScript modules
const isEcmaScriptModule = dir => {
	const packageJsonPath = path.join(dir, "package.json");
	try {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
		return packageJson.type === "module";
	} catch (err) {
		return false;
	}
};

// Read all directories in node_modules
const getEcmaScriptModules = () => {
	const packages = fs.readdirSync(nodeModulesPath).filter(packageName => {
		const packageDir = path.join(nodeModulesPath, packageName);

		// Skip scoped packages like @scope/package
		if (packageName.startsWith("@")) {
			const scopedPackages = fs.readdirSync(packageDir).filter(subPackage => {
				const subPackageDir = path.join(packageDir, subPackage);
				return hasPackageJson(subPackageDir) && isEcmaScriptModule(subPackageDir);
			});
			return scopedPackages.length > 0;
		}

		return hasPackageJson(packageDir) && isEcmaScriptModule(packageDir);
	});

	return packages;
};

// Write the result array to the console
const ecmaScriptModules = getEcmaScriptModules().filter(Boolean);
fs.writeFileSync("ecmaModules.json", JSON.stringify(ecmaScriptModules, null, 2));
