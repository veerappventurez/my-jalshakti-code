const response = require('../response/index');
const httpStatus = require('http-status');

const reqValidator = (schema, source = 'body') => async (req, res, next) => {
  const data = req[source];
  const { error } = schema.validate(data);
  const valid = error == null;
  if (valid) {
    return next();
  } else {
    const { details } = error;
    const message = details.map((i) => i.message).join(',');
    return response.error(req, res, { msgCode: 'VALIDATION_ERROR', data: message }, httpStatus.BAD_REQUEST);
  }
};

module.exports = {
  reqValidator
};
