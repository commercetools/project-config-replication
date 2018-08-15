import fs from 'fs';
import MigrationError from './MigrationError';

export const MIGRATION_KEY_PREFIX = 'ct-migrate-';
export const MIGRATION_CONTAINER = 'ct-migrations';
export const MIGRATION_LAST_APPLIED_KEY = 'ct-last-applied';
export const MIGRATION_FILENAME_REGEX = /[0-9]{5}-.*.json/;

export default class Migration {
  constructor({ commercetools, migrationsDirectory }) {
    this.ct = commercetools;
    this.dir = migrationsDirectory;
    this.lastApplied = { value: -1 };
  }

  // Returns the last applied migration
  async getLastApplied() {
    console.debug('Fetching last applied migration.');
    const key = MIGRATION_LAST_APPLIED_KEY;
    const lastApplied = await this.ct.client
      .execute({
        uri: `${this.ct.getRequestBuilder().customObjects.build()}/${MIGRATION_CONTAINER}/${key}`,
        method: 'GET',
      })
      .then(res => res.body)
      .catch(e => {
        if (e.body.statusCode === 404) {
          return { value: -1 };
        }
        throw e;
      });
    this.lastApplied = lastApplied || { value: -1 };
  }

  // attempts to apply any new migrations
  async applyNewMigrations() {
    console.info(`Scanning ${this.dir} for migrations to apply...`);
    // read migration filenames from dir
    const dirListing = fs.readdirSync(this.dir).sort();
    for (let i = 0; i < dirListing.length; i += 1) {
      const migrationFile = dirListing[i];
      // if filename does not match our regex
      if (!migrationFile.match(MIGRATION_FILENAME_REGEX)) {
        console.info(`Skipping file ${migrationFile} as it does not match our migration file name rules.`);
        return;
      }
      // migrate file if it is newer than lastApplied
      if (parseInt(this.lastApplied.value) < parseInt(migrationFile, 10)) {
        console.info(`Applying migration ${migrationFile}`);
        // eslint-disable-next-line no-await-in-loop
        await this.applyMigration(migrationFile);
        console.info(`Migration ${migrationFile} applied successfully`);
        // eslint-disable-next-line no-await-in-loop
        await this.setLastApplied(migrationFile);
        console.debug(`Set last applied to ${migrationFile}`);
      } else {
        console.info(`Skipping file ${migrationFile} as we've already applied it.`);
      }
    }
  }

  // sets the last applied migration
  async setLastApplied(migration) {
    // create or update our custom object with the filename of what was last applied.
    const requestBuilder = this.ct.getRequestBuilder();

    return this.ct.client
      .execute({
        uri: requestBuilder.customObjects.build(),
        method: 'POST',
        body: JSON.stringify({
          container: MIGRATION_CONTAINER,
          key: MIGRATION_LAST_APPLIED_KEY,
          value: migration,
        }),
      })
      .then(res => res.body);
  }

  // applies a migration
  async applyMigration(migrationFile) {
    const rawMigration = fs.readFileSync(`${this.dir}/${migrationFile}`);
    const migration = JSON.parse(rawMigration);
    if (!migration.action) {
      throw new MigrationError(`Migration missing action field: ${migrationFile}`);
    }
    if (!migration.type) {
      throw new MigrationError(`Migration missing type field: ${migrationFile}`);
    }
    if (!migration.key) {
      throw new MigrationError(`Migration missing key field: ${migrationFile}`);
    }
    if (migration.action.toLowerCase() === 'update' && !migration.actions) {
      throw new MigrationError(`Update migration missing actions field: ${migrationFile}`);
    }
    if (migration.action.toLowerCase() === 'create' && !migration.payload) {
      throw new MigrationError(`Create migration missing payload field: ${migrationFile}`);
    }
    // if we're creating a resource
    if (migration.action.toLowerCase() === 'create') {
      console.info(`Creating resource ${migration.type}`);
      try {
        await this.applyCreation(migration);
      } catch(e) {
        console.error(e)
        throw e
      }
      console.info(`Created resource ${migration.type}/${migration.key}`);
    } else {
      console.debug(`Getting current version of ${migration.type}/${migration.key}`)
      const uri = this.ct.getRequestBuilder()[migration.type].byKey(migration.key).build();
      console.debug(uri)
      const getReq = {
        uri,
        method: 'GET',
      };
      const currentVersion = await this.ct.client.execute(getReq).then(res => res.body);
      console.debug(currentVersion)
      // if we're deleting a resource
      if (migration.action.toLowerCase() === 'delete') {
        console.info(`Deleting resource ${migration.type}/${migration.key}`);
        const request = {
          uri: `${uri}?version=${currentVersion.version}`,
          method: 'DELETE',
        };
        return this.ct.client.execute(request);
        // if we're updating a resource
      } else if (migration.action.toLowerCase() === 'update') {
        console.info(`Updating resource ${migration.type}/${migration.key}`);
        const request = {
          uri,
          method: 'POST',
          body: JSON.stringify({
            version: currentVersion.version,
            actions: migration.actions,
          }),
        };
        return this.ct.client.execute(request);
      }
    }
  }

  // applies a creation type migration.
  async applyCreation(migration) {
    const uri = this.ct.getRequestBuilder()[migration.type].build();
    const req = {
      uri,
      method: 'POST',
      body: JSON.stringify(migration.payload),
    };
    return this.ct.client.execute(req);
  }
}
