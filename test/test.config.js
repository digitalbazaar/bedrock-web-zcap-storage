/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');
const path = require('path');

config.karma.suites['bedrock-web-kms'] = path.join('web', '**', '*.js');

config.karma.config.proxies = {
  '/': 'https://bedrock.localhost:18443'
};
config.karma.config.proxyValidateSSL = false;

// mongodb config
config.mongodb.name = 'bedrock_zcap_storage_test';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
// drop all collections on initialization
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

// allow self-signed certs in test framework
config['https-agent'].rejectUnauthorized = false;
