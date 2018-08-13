#!/usr/bin/env node

/**
 * ct-migrations A tool for applying changes to a commercetools project.
 *
 */

import commander from 'commander';
import fs from 'fs';

commander.version('0.1.0', '-v, --version')
  .usage('[options] <migrationsDirectory>')
  .arguments('[options] <migrationsDirectory>')
  .option('-c, --clientId [clientId]', 'Client ID', process.env.CLIENT_ID)
  .option('-s, --clientSecret [clientSecret]', 'Client Secret', process.env.CLIENT_SECRET)
  .option('-p, --projectKey [projectKey]', 'Project Key', process.env.PROJECT_KEY)
  .option('-a, --authUrl [authUrl]', 'Auth URL', process.env.AUTH_URL || 'https://auth.commercetools.co')
  .option('-i, --apiUrl [apiUrl]', 'API URL', process.env.API_URL || 'https://api.commercetools.co')
  .option('-d, --dryRun', 'Dry Run', false);

commander.on('--help', () => {
  console.log('  Environment Variables:');
  console.log('');
  console.log('    CLIENT_ID');
  console.log('    CLIENT_SECRET');
  console.log('    PROJECT_KEY');
  console.log('    AUTH_URL');
  console.log('    API_URL');
  console.log('');
});

commander.parse(process.argv);

// ensure we have a migrations dir and all settings are set.
let valid = true;
if (!commander.clientId) {
  console.log('No client ID specified.  Please set CLIENT_ID or use the -c/--clientId flag to specify one.');
  valid = false;
}
if (!commander.clientSecret) {
  console.log('No client secret specified.  Please set CLIENT_SECRET or use the -s/--clientSecret flag to specify one.');
  valid = false;
}
if (!commander.projectKey) {
  console.log('No project key specified.  Please set PROJECT_KEY or use the -p/--projectKey flag to specify one.');
  valid = false;
}
if (!commander.args[0]) {
  console.log('No migrations directory specified.  Usage: ct-migrate [options] <migrationsDirectory>');
  valid = false;
}
if (!fs.existsSync(commander.args[0]) || !fs.lstatSync(commander.args[0]).isDirectory()) {
  console.log(`Migrations directory "${commander.args[0]}" is not a directory.  Usage: ct-migrate [options] <migrationsDirectory>`);
  valid = false;
}
// exit if missing a parameter
if (!valid) {
  process.exit(1);
}

// verify ct client credentials


// get last applied migration

// find migrations greater than the last applied one

// apply them
