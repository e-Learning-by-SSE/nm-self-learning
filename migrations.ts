import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { readdirSync, existsSync, mkdirSync, copyFileSync, renameSync, rmSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
const prismaPath = join(__dirname, "libs", "data-access", "database", "prisma");
const migrationsPath = join(prismaPath, "migrations");
const migrationsTempPath = join(prismaPath, "migrations_temp");

async function main() {
	// Step 1: Rename  Migrations folder and copy lock
	renameSync(migrationsPath, migrationsTempPath);
	mkdirSync(migrationsPath, { recursive: true });
	copyFileSync(
		join(migrationsTempPath, "migration_lock.toml"),
		join(migrationsPath, "migration_lock.toml")
	);

	// Step 2: Identify all migrations
	const migrations = readdirSync(migrationsTempPath)
		.sort()
		.filter(folder => existsSync(join(migrationsTempPath, folder, "migration.sql")));

	// Step 3: Run each migration
	for (const migration of migrations) {
		console.log(`Applying migration ${migration}`);
		const migrationSrcFolder = join(migrationsTempPath, migration);
		const migrationTrgFolder = join(migrationsPath, migration);
		mkdirSync(migrationTrgFolder, { recursive: true });

		// Execute the DB migration
		const dbMigrationSrcFile = join(migrationSrcFolder, "migration.sql");
		let migrationApplied = true;
		if (existsSync(dbMigrationSrcFile)) {
			copyFileSync(dbMigrationSrcFile, join(migrationTrgFolder, "migration.sql"));
			try {
				const result = execSync(`npx prisma migrate deploy`);
				console.log(result.toString());
				if (result.toString().includes("No pending migrations to apply.")) {
					migrationApplied = false;
				}
			} catch (e) {
				migrationApplied = false;
				console.error("Error: ", e);
			}
		}

		// Copy data migration script if exists
		const dataMigrationSrcFile = join(migrationSrcFolder, "data-migration.ts");
		if (existsSync(dataMigrationSrcFile)) {
			copyFileSync(dataMigrationSrcFile, join(migrationTrgFolder, "data-migration.ts"));
			// Execute the data migration if DB migration was applied
			if (migrationApplied) {
				console.log(`Applying data migration for ${migration}`);
				await import(dataMigrationSrcFile);
			}
		}
	}

	// Step 4: Cleanup
	rmSync(migrationsTempPath, { recursive: true, force: true });
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
