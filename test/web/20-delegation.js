/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {DelegationService} from 'bedrock-web-zcap-storage';

const delegationService = new DelegationService();
import mockData from './mock-data.js';

describe('delegation API', () => {
  describe('create API', () => {
    describe('authenticated request', () => {
      it('stores a delegation', async () => {
        const mockDelegation = Object.assign({}, mockData.delegations.alpha);
        mockDelegation.capability.id =
          'urn:zcap:f4e369e4-d993-4a6b-bdb2-9a6db1ae3873';
        let err;
        let result;
        try {
          result = await delegationService.create(mockDelegation);
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        result.should.equal('');

        const findResult = await delegationService.find();
        const foundResult = findResult
          .find(r => r.capability.id === mockDelegation.capability.id);
        foundResult.capability.should.eql(mockDelegation.capability);
      });
      it('DuplicateError on same capability ID', async () => {
        const mockDelegation = Object.assign({}, mockData.delegations.alpha);
        mockDelegation.capability.id =
          'urn:zcap:5e39c871-a584-47af-bfb3-b598c8ca6010';
        let err;
        let result;
        try {
          result = await delegationService.create(mockDelegation);
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        result.should.equal('');

        err = null;
        result = null;
        try {
          result = await delegationService.create(mockDelegation);
        } catch(e) {
          err = e;
        }
        should.exist(err);
        err.message.should.contain('DuplicateError');
      });
      it('permission denied if controller != authenticated user', async () => {
        const mockDelegation = Object.assign({}, mockData.delegations.alpha);
        mockDelegation.capability.id =
          'urn:zcap:d61edb01-926d-4425-851e-96eab13c1325';

        // alpha is the authenticated user, not beta
        mockDelegation.controller = mockData.actors.beta.id;
        let err;
        let result;
        try {
          result = await delegationService.create(mockDelegation);
        } catch(e) {
          err = e;
        }
        should.exist(err);
        should.not.exist(result);
        err.message.should.contain('NotAllowedError');
      });
    });
  }); // end create

  describe('find API', () => {
    let mockDelegation;
    before(async () => {
      const mockController = mockData.actors.alpha.id;
      mockDelegation = Object.assign({}, mockData.delegations.alpha);
      mockDelegation.capability.id =
        'urn:zcap:8093ca62-c34d-440c-888f-fba7b780f5ec';
      mockDelegation.controller = mockController;
      await delegationService.create(mockDelegation);
    });
    describe('authenticated request', () => {
      it('finds delegations by controller', async () => {
        let err;
        let result;
        try {
          result = await delegationService.find();
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        should.exist(result);
        result.should.be.an('array');
        const foundResult = result
          .find(r => r.capability.id === mockDelegation.capability.id);
        foundResult.capability.should.eql(mockDelegation.capability);
        should.exist(foundResult.meta);
        const {meta} = foundResult;
        meta.should.have.property('created');
        meta.should.have.property('updated');
        meta.should.have.property('controller');
        meta.controller.should.equal(mockDelegation.controller);
        meta.should.have.property('delegator');
        meta.delegator.should.equal(mockDelegation.delegator);
        meta.should.have.property('domain');
        meta.domain.should.equal(mockDelegation.domain);
        meta.should.have.property('status');
        meta.status.should.be.a('string');
        meta.status.should.equal('active');
      });
    });
  }); // end find

  describe('remove API', () => {
    let mockDelegation;
    before(async () => {
      const mockController = mockData.actors.alpha.id;
      mockDelegation = Object.assign({}, mockData.delegations.alpha);
      mockDelegation.capability.id =
        'urn:zcap:e0c28ab2-612e-44e2-82ff-9d5e6ff1f785';
      mockDelegation.controller = mockController;
      await delegationService.create(mockDelegation);
    });
    describe('authenticated request', () => {
      it('removes a delegation', async () => {
        let err;
        let result;
        try {
          result = await delegationService.delete(
            {id: mockDelegation.capability.id});
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        result.should.equal('');

        // a second attempt should result in 404
        err = null;
        result = null;
        try {
          result = await delegationService.delete(
            {id: mockDelegation.capability.id});
        } catch(e) {
          err = e;
        }
        should.exist(err);
        err.message.should.contain('NotFoundError');
      });
    });
  }); // end remove
});
