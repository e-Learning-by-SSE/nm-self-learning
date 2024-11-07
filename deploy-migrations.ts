import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { readdirSync, existsSync, mkdirSync, renameSync, rmSync, statSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
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
		let migrationApplied = true;
		let result = "";
		try {
			result = execSync(`npx prisma migrate deploy`).toString();
			if (result.includes("No pending migrations to apply.")) {
				console.log(
					`⮡ Database migration ${migration}\x1b[1m\x1b[33m already applied\x1b[0m.`
				);
				migrationApplied = false;
			} else {
				console.log(
					`⮡ Database migration ${migration}\x1b[1m\x1b[32m successfully applied\x1b[0m.`
				);
			}
		} catch (e) {
			migrationApplied = false;
			console.log("⮡ Database migration ${migration}\x1b[1m\x1b[31m failed:\x1b[0m\n" + e);
			cleanup();
			process.exit(1);
		}

		// Apply data migration if exists
		const dataMigrationFile = join(migrationsPath, migration, dataMigration);
		if (migrationApplied && existsSync(dataMigrationFile)) {
			console.log(`⮡ Applying\x1b[1m\x1b[34m data migration\x1b[0m`);
			execSync(`npx prisma db pull`, { stdio: "inherit" });
			execSync(`npx prisma generate`, { stdio: "inherit" });
			await import(dataMigrationFile);
		}

		if (i === migrations.length - 1) {
			// Print log of last migration
			console.log(result);
		}
	}

	// Step 4: Cleanup
	cleanup();
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
