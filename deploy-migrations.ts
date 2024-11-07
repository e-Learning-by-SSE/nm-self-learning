import { execSync } from "child_process";
import { readdirSync, existsSync, mkdirSync, renameSync, rmSync, statSync } from "fs";
import { join } from "path";

const prismaPath = join(__dirname, "libs", "data-access", "database", "prisma");
const migrationsPath = join(prismaPath, "migrations");
const migrationsTempPath = join(prismaPath, "migrations_temp");
const dbMigration = "migration.sql";
const dataMigration = "data-migration.ts";

function isMigration(path: string) {
	if (statSync(path).isDirectory()) {
		return existsSync(join(path, dbMigration));
	}
	return false;
}

/**
 * Move a file or a folder from the temp directory to the migrations directory.
 * @param file The relative path of the file or folder to move.
 */
function moveToMigrationDir(file: string) {
	renameSync(join(migrationsTempPath, file), join(migrationsPath, file));
}

/*
 * Moves all remaining files from temp back to migration folder and deleted temp folder.
 */
function cleanup() {
	readdirSync(migrationsTempPath).forEach(moveToMigrationDir);
	rmSync(migrationsTempPath, { recursive: true, force: true });
}

/**
 * Applies (step-wise) the database migration.
 * @param migration The currently applied migration
 * @returns The status of the migration and the `stdin` output of the migration
 */
function migrateDatabase(migration: string) {
	let migrationApplied = false;
	let result = "";
	try {
		result = execSync(`npx prisma migrate deploy`).toString();
		if (result.includes("No pending migrations to apply.")) {
			console.log(`⮡ Database migration ${migration}\x1b[1m\x1b[33m already applied\x1b[0m.`);
		} else {
			console.log(
				`⮡ Database migration ${migration}\x1b[1m\x1b[32m successfully applied\x1b[0m.`
			);
			migrationApplied = true;
		}
	} catch (e) {
		console.log("⮡ Database migration \x1b[1m\x1b[31m failed:\x1b[0m\n" + e);
		cleanup();
		process.exit(1);
	}
	return { migrationApplied, result };
}

/**
 * Tests and executes a data migration if it exists.
 * The data migration must be placed in the migration folder and named `data-migration.ts`.
 * Will only be executed if the database migration was applied successfully.
 * @param migration The currently applied migration
 * @param migrationApplied Status of the database migration
 */
async function migrateData(migration: string, migrationApplied: boolean) {
	const dataMigrationFile = join(migrationsPath, migration, dataMigration);
	if (migrationApplied && existsSync(dataMigrationFile)) {
		console.log(`⮡ Applying\x1b[1m\x1b[34m data migration\x1b[0m`);
		// Create a Prisma client based on current database schema
		execSync(`npx prisma db pull`);
		execSync(`npx prisma generate`);
		try {
			const module = await import(dataMigrationFile);
			if (module.main) {
				// Manually call and await the `main` function from the imported file
				// Otherwise it may be executed in parallel with the next migration
				await module.main();
			}
		} catch (e) {
			console.error("⮡ Data migration \x1b[1m\x1b[31m failed:\x1b[0m\n", e);
			cleanup();
			process.exit(1);
		}
	}
}

async function main() {
	// Step 1: Rename  Migrations folder and copy all non-migration files and folders
	renameSync(migrationsPath, migrationsTempPath);
	mkdirSync(migrationsPath, { recursive: true });
	const files = readdirSync(migrationsTempPath);
	files.filter(file => !isMigration(join(migrationsTempPath, file))).forEach(moveToMigrationDir);

	// Step 2: Identify all migrations
	// Alphabetic sorting is important to ensure that migrations are applied as Prisma does
	// https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining#baselining-a-database
	const migrations = readdirSync(migrationsTempPath)
		.sort()
		.filter(folder => existsSync(join(migrationsTempPath, folder, "migration.sql")));

	// Step 3: Run each migration
	for (let i = 0; i < migrations.length; i++) {
		const migration = migrations[i];
		console.log(`Applying migration \x1b[1m\x1b[34m${migration}\x1b[0m`);
		moveToMigrationDir(migration);

		// Execute the DB migration
		let { migrationApplied, result } = migrateDatabase(migration);

		// Apply data migration if exists
		await migrateData(migration, migrationApplied);

		if (i === migrations.length - 1) {
			// Print log of last migration
			console.log(result);
		}
	}

	// Step 4: Cleanup
	cleanup();
}

main().catch(async e => {
	console.error(e);
	process.exit(1);
});
