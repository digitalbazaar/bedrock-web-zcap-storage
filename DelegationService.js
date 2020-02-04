/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import axios from 'axios';

/**
 * This service is used to encapsulate all delegation activity for a project.
 * @param {Object} [config = {urls: {base: '/zcaps/delegations'}}]
 * @param {string} [config.baseURL] - The protocol, host and port for use with
 *   node.js (e.g. https://example.com)
 * @param {object} [config.httpsAgent] - An optional
 *   node.js `https.Agent` instance to use when making requests.
 * @param {Object} [config.urls = {}]
 * @param {string} [config.urls.base = '/zcaps/delegations']
 */
export class DelegationService {
  constructor({
    baseURL,
    httpsAgent,
    urls = {
      base: '/zcaps/delegations'
    }
  } = {}) {
    this.config = {urls};
    const headers = {Accept: 'application/ld+json, application/json'};
    this._axios = axios.create({
      baseURL,
      headers,
      httpsAgent,
    });
  }

  /**
   * Create a capability delegation.
   *
   * @param {Object} options - The options to use.
   * @param {Object} options.capability - The capability delegation.
   * @param {string} [options.controller] - The id for the controller.
   * @param {string} options.delegator - The id for the delegator.
   * @param {string} [options.domain] - The domain to associate with the
   *   delegation.
   * @param {string} [options.url = '/zcaps/delegations'] - The url to use.
   *
   * @returns {Promise} Resolves when the operation completes.
   */
  async create({
    url = this.config.urls.base,
    capability,
    controller,
    delegator,
    domain,
  }) {
    try {
      const response = await this._axios.post(url, {
        capability, controller, delegator, domain
      });
      return response.data;
    } catch(e) {
      _rethrowAxiosError(e);
    }
  }

  /**
   * Delete a capability delegation.
   *
   * @param {Object} options - The options to use.
   * @param {string} [options.controller] - The id for the controller.
   * @param {string} options.id - The id for the delegated capability.
   * @param {string} [options.url = '/zcaps/delegations'] - The url to use.
   *
   * @returns {Promise} Resolves when the operation completes.
   */
  async delete({
    url = this.config.urls.base,
    controller,
    id,
  }) {
    try {
      const response = await this._axios.delete(
        `${url}/${encodeURIComponent(id)}`, {controller, id});
      return response.data;
    } catch(e) {
      _rethrowAxiosError(e);
    }
  }

  /**
   * Find capability delegations.
   *
   * @param {Object} options - The options to use.
   * @param {string} [options.controller] - The id for the controller.
   * @param {string} [options.url = '/zcaps/delegations'] - The url to use.
   *
   * @returns {Promise} Resolves when the operation completes.
   */
  async find({
    url = this.config.urls.base,
    controller,
  } = {}) {
    const query = {};
    if(controller) {
      query.controller = encodeURIComponent(controller);
    }
    try {
      const response = await axios.get(url, query);
      return response.data;
    } catch(e) {
      _rethrowAxiosError(e);
    }
  }
}

function _rethrowAxiosError(error) {
  if(error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    // FIXME: there may be better wrappers already created
    if(error.response.data.message && error.response.data.type) {
      throw new Error(
        `${error.response.data.type}: ${error.response.data.message}`);
    }
  }
  throw new Error(error.message);
}
