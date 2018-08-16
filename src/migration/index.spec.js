import nock from 'nock';
import Migration, { MIGRATION_CONTAINER, MIGRATION_LAST_APPLIED_KEY } from './index';
import Commercetools from '../commercetools';

const logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

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
    migration = new Migration({
      commercetools, migrationsDirectory, dryRun, logger,
    });
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

  describe('setLastApplied', () => {
    const lastApplied = { value: '00003-some-migration.json' };
    beforeEach(() => {
      nock(host)
        .persist()
        .post(`/${projectKey}/custom-objects/${MIGRATION_CONTAINER}/${MIGRATION_LAST_APPLIED_KEY}`)
        .reply(200, lastApplied);
    });
    it('should return an object with a "value" property', () =>
      expect(migration.getLastApplied()).resolves.toHaveProperty('value'));
  });

  describe('applyCreation', () => {
    const sampleMigration = {
      action: 'create',
      type: 'productTypes',
      key: 'sample-shirt',
      payload: {
        key: 'sample-shirt',
        name: 'Sample Shirt',
        description: 'A Sample Shirt product type',
        attributes: [{
          type: {
            name: 'text',
          },
          name: 'material',
          label: { en: 'Material' },
          isRequired: false,
          attributeConstraint: 'None',
          inputHint: 'SingleLine',
          isSearchable: false,
        }],
      },
    };
    beforeEach(() => {
      nock(host)
        .persist()
        .post(`/${projectKey}/product-types`)
        .reply(200, sampleMigration.payload);
    });
    it('should return the created resource', () =>
      expect(migration.applyCreation(sampleMigration)).resolves.toEqual(sampleMigration.payload));
  });

  describe('applyNewMigrations', () => {

  });

  describe('applyMigration', () => {

  });
});
