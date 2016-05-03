'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const inputFile = _fs2.default.readFileSync('input.txt', 'utf8');

const matrix = inputFile.split('\n').filter(line => line.trim().length);

console.log((0, _utils.getStructure)(matrix));
//# sourceMappingURL=index.js.map
