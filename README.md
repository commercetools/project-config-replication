ct-apply-migration
====

This tool is provided to provide a scriptable interface to applying changes between commercetools projects.
Given a directory of files each with a change (referred to as a migration), this tool will apply them to the configured project.


Installation
----

Install this project's dependencies by running `npm install`.  Run `npm build` to build this project.

How to write a migration
---

A migration is a JSON file with a few fields defined.  All migrations should have top-level "type", "action" and "key" fields defined.  These refer to the resource type (product, productType, etc), the action to apply ("create", "update", "delete"), and the key to locate the resource on commercetools.  Additionally migrations with the type "create" must have a top-level field "payload", and migrations with type "update" must have a top-level field "actions".  The payload defines the resource draft and the actions is an array of update actions to apply to the resource.  There are examples included in the examples directory.  Each migration's filename must begin with a 5 digit number, 00000 to 99999 indicating the order in which to apply the migrations.  Also the filename should be structured like the following: 00000-action-description.json.  Lower-numbered migrations are run first.

Configuration
---
There are several optional flags to configure this program, alternatively you may use environment variables.  See the output of `node dist/index.js --help` for more information.

Running
---
Run the program via `node dist/index.js [options] <pathToMigrationDirectory>`

More Info
---
This script will create a custom object "ct-migrations/ct-last-applied" in your commerctools project to keep track of the last applied migration.  This script relies on this custom object, alter it at your own risk.
