const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to migrations folder
const migrationsDir = path.join(__dirname, '..', 'libs', 'data-access', 'database', 'prisma', 'migrations');

// Read all migration folders
const isDirectory = source => fs.lstatSync(source).isDirectory();
const migrations = fs.readdirSync(migrationsDir).filter(name => {
    const fullPath = path.join(migrationsDir, name);
    return isDirectory(fullPath);
  });

migrations.forEach(migration => {
    try {
        console.log("Marking migration \x1b[1;34m%s\x1b[0m as applied", migration);
        execSync(`npx prisma migrate resolve --applied ${migration}`, { stdio: 'pipe' });
    } catch (error) {
        // Check if the error indicates the migration has already been applied
        const stderr = error.stderr ? error.stderr.toString() : error.message || '';
        if (stderr.includes(`is already recorded as applied in the database.`)) {
            console.log("Migration \x1b[1;34m%s\x1b[0m has already been applied \x1b[32m✔\x1b[0m", migration);
        } else {
          // If it's another error, rethrow it
          const msg = `Error resolving migration \x1b[1;31m${migration}\x1b[0m:\n${stderr}`;
          throw new Error(msg);
        }
      }
});
