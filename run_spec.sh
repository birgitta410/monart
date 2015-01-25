#!/bin/sh
node node_modules/jasmine-node/bin/jasmine-node --captureExceptions ./spec/miroGocdMapperSpec.js
node node_modules/jasmine-node/bin/jasmine-node --captureExceptions ./spec/haringGocdMapperSpec.js
node node_modules/jasmine-node/bin/jasmine-node --captureExceptions ./spec/haringVierGewinntSpec.js
node node_modules/jasmine-node/bin/jasmine-node --captureExceptions ./spec/haringGocdMapperIntegSpec.js