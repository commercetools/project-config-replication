import nock from 'nock';
import Migration, { MIGRATION_CONTAINER, MIGRATION_LAST_APPLIED_KEY } from './index';
import Commercetools from '../commercetools';


describe('Migration', () => {
  const clientId = 'client1';
  const clientSecret = 'secret1';
  const projectKey = 'projectKey1';
  const host = 'https://api.commercetools.co';
  const oauthHost = 'https://auth.commercetools.co';
  const migrationsDirectory = './';
  const dryRun = false;

  const commercetools = Commercetools({
    clientId,
    clientSecret,
    projectKey,
    host,
    oauthHost,
  });
  let migration;

  beforeAll(() => {
    nock(oauthHost)
      .persist()
      .post('/oauth/token')
      .reply(200, {
        access_token: 'token1',
      });
  });

  beforeEach(() => {
    migration = new Migration({ commercetools, migrationsDirectory, dryRun });
  });

  describe('getLastApplied', () => {
    const lastApplied = { value: '00003-some-migration.json' };
    beforeEach(() => {
      nock(host)
        .persist()
        .get(`/${projectKey}/custom-objects/${MIGRATION_CONTAINER}/${MIGRATION_LAST_APPLIED_KEY}`)
        .reply(200, lastApplied);
    });
    it('should return an object with a "value" property', () =>
      expect(migration.getLastApplied()).resolves.toHaveProperty('value'));
  });

  describe('applyNewMigrations', () => {

  });

  describe('setLastApplied', () => {

  });

  describe('applyCreation', () => {

  });
});
