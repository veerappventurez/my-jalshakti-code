const HttpStatus = require('http-status');
const response = require('../response/index');

// Method not allowed error middleware.
exports.methodNotAllowed = (req, res) => {
  return response.error(req, res, { msgCode: 'INVALID_ROUTE' }, HttpStatus.METHOD_NOT_ALLOWED);
};
