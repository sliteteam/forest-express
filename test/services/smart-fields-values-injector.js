const chai = require('chai');
const chaiSubset = require('chai-subset');
const _ = require('lodash');
const SmartFieldsValuesInjector = require('../../src/services/smart-fields-values-injector');
const Schemas = require('../../src/generators/schemas');
const usersSchema = require('../fixtures/users-schema.js');
const addressesSchema = require('../fixtures/addresses-schema.js');

const { expect } = chai;
chai.use(chaiSubset);

describe('Service > Smart Fields Values Injector', () => {
  describe('without Smart Fields', () => {
    it('should not modify the record', async () => {
      // NOTICE: Clone users fixture and remove smart field.
      const usersSchemaWithoutSmartField = _.cloneDeep(usersSchema);
      usersSchemaWithoutSmartField.fields.shift();
      Schemas.schemas = { users: usersSchemaWithoutSmartField };
      const record = { id: 123 };
      const fieldsPerModel = { users: ['id'] };
      const injector = new SmartFieldsValuesInjector(record, 'users', fieldsPerModel);
      await injector.perform();
      expect(record).to.be.deep.equal({ id: 123 });
    });
  });

  describe('with a simple Smart Field', () => {
    it('should inject the Smart Field value in the record', async () => {
      Schemas.schemas = { users: usersSchema };
      const record = { id: 123 };
      const fieldsPerModel = { users: ['id', 'smart'] };
      const injector = new SmartFieldsValuesInjector(record, 'users', fieldsPerModel);
      await injector.perform();
      expect(record).to.be.deep.equal({ id: 123, smart: { foo: 'bar' } });
    });
  });

  describe('with a Smart Relationship that reference a collection having a Smart Field', () => {
    const record = { id: 456 };
    const fieldsPerModel = { users: ['smart'], addresses: ['id', 'user'] };
    it('should inject the Smart Relationship reference', async () => {
      Schemas.schemas = { users: usersSchema, addresses: addressesSchema };
      const injector = new SmartFieldsValuesInjector(record, 'addresses', fieldsPerModel);
      await injector.perform();
      expect(record.user).not.to.be.undefined;
    });
    it('should inject the Smart Field of the record referenced by the Smart Relationship', async () => {
      Schemas.schemas = { users: usersSchema, addresses: addressesSchema };
      const injector = new SmartFieldsValuesInjector(record, 'addresses', fieldsPerModel);
      await injector.perform();
      expect(record.user.smart).to.be.deep.equal({ foo: 'bar' });
    });
  });
});
