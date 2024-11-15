import { execSync } from "child_process";
import {
	readdirSync,
	existsSync,
	mkdirSync,
	rmSync,
	statSync,
	copyFileSync,
	lstatSync,
	unlinkSync,
	rmdirSync
} from "fs";
import { join } from "path";

// Color scheme definitions
const normal = "\x1b[0m";
const success = "\x1b[1m\x1b[32m";
const error = "\x1b[1m\x1b[31m";
const neutral = "\x1b[1m\x1b[33m";
const info = "\x1b[1m\x1b[34m";

const prismaPath = __dirname;
const migrationsPath = join(prismaPath, "migrations");
const migrationsTempPath = join(prismaPath, "migrations_temp");
const schemaPath = join(prismaPath, "schema");
const schemaTempPath = join(prismaPath, "schema_temp");
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
	moveSync(join(migrationsTempPath, file), join(migrationsPath, file));
}

/*
 * Restores original migration and schema files.
 */
function cleanup() {
	// Restore migrations and delete temp folder
	readdirSync(migrationsTempPath).forEach(moveToMigrationDir);
	rmSync(migrationsTempPath, { recursive: true, force: true });

	// Restore schema files
	const schemaFiles = readdirSync(schemaTempPath);
	schemaFiles.forEach(file => copyFileSync(join(schemaTempPath, file), join(schemaPath, file)));
	rmSync(schemaTempPath, { recursive: true, force: true });
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
			console.log(`⮡ Database migration ${migration} ${neutral}already applied${normal}.`);
		} else {
			console.log(
				`⮡ Database migration ${migration} ${success}successfully applied${normal}.`
			);
			migrationApplied = true;
		}
	} catch (e) {
		console.log(`⮡ Database migration ${error}failed:${normal}\n` + e);
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
function migrateData(migration: string, migrationApplied: boolean) {
	const dataMigrationFile = join(migrationsPath, migration, dataMigration);
	if (migrationApplied && existsSync(dataMigrationFile)) {
		console.log(`⮡ Applying ${info}data migration${normal}`);
		// Create a Prisma client based on current database schema
		execSync(`npx prisma db pull`);
		execSync(`npx prisma generate`);
		try {
			// Execute the data migration in a separate process (to support alternative versions of Prisma Client)
			execSync(`npx ts-node --esm --skipProject ${dataMigrationFile}`);
			return true;
		} catch (error) {
			console.error(`⮡ Data migration ${error}failed.${normal}`);
			cleanup();
			// Restore original Prisma Client
			execSync(`npx prisma generate`);
			process.exit(1);
		}
	}
	return false;
}

function main() {
	// Step 1: Rename  Migrations folder and copy all non-migration files and folders
	moveSync(migrationsPath, migrationsTempPath);
	mkdirSync(migrationsPath, { recursive: true });
	const files = readdirSync(migrationsTempPath);
	files.filter(file => !isMigration(join(migrationsTempPath, file))).forEach(moveToMigrationDir);

	// Step 1.1: Create backup of schema.prisma
	mkdirSync(schemaTempPath, { recursive: true });
	const schemaFiles = readdirSync(schemaPath);
	schemaFiles.forEach(file => copyFileSync(join(schemaPath, file), join(schemaTempPath, file)));

	// Step 2: Identify all migrations
	// Alphabetic sorting is important to ensure that migrations are applied as Prisma does
	// https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining#baselining-a-database
	const migrations = readdirSync(migrationsTempPath)
		.sort()
		.filter(folder => existsSync(join(migrationsTempPath, folder, "migration.sql")));

	// Step 3: Run each migration
	let dataMigrationApplied = false;
	for (let i = 0; i < migrations.length; i++) {
		const migration = migrations[i];
		console.log(`Applying migration ${info}${migration}${normal}`);
		moveToMigrationDir(migration);

		// Execute the DB migration
		const { migrationApplied, result } = migrateDatabase(migration);

		// Apply data migration if exists
		dataMigrationApplied = dataMigrationApplied || migrateData(migration, migrationApplied);

		if (i === migrations.length - 1) {
			// Print log of last migration
			console.log(result);
		}
	}

	// Step 4: Cleanup
	cleanup();
	if (dataMigrationApplied) {
		// Restore original Prisma Client
		execSync(`npx prisma generate`);
	}
}

/**
 * Alternative to `renameSync` that moves directories recursively, because Docker file systems do not support it.
 * @param source file or directory to move
 * @param destination file or directory to move to
 */
function moveSync(source: string, destination: string) {
	if (!existsSync(source)) {
		throw new Error(`Source ${source} does not exist.`);
	}

	if (!lstatSync(source).isDirectory()) {
		// Move files
		copyFileSync(source, destination);
		// Remove original file after copying
		unlinkSync(source);
	} else {
		// Create destination folder if it does not exist
		if (!existsSync(destination)) {
			mkdirSync(destination, { recursive: true });
		}

		// Get the contents of the source directory
		readdirSync(source).forEach(file => {
			const sourcePath = join(source, file);
			const destinationPath = join(destination, file);

			if (lstatSync(sourcePath).isDirectory()) {
				// Recursively move subdirectories
				moveSync(sourcePath, destinationPath);
			} else {
				// Move files
				copyFileSync(sourcePath, destinationPath);
				// Remove original file after copying
				unlinkSync(sourcePath);
			}
		});

		// Remove the source directory after all contents have been moved
		rmdirSync(source);
	}
}

try {
	main();
} catch (e) {
	console.error(e);
	process.exit(1);
}
