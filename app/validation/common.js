const Joi = require('joi');
const { orderingKeys } = require('../constant/common');
const { DEFAULT_VALUE, password, allowedDomains, ID } = require('../constant/auth');

const search = Joi.string().trim().optional();

const page = Joi.number().min(DEFAULT_VALUE.MIN).default(DEFAULT_VALUE.MIN);

const size = Joi.number().min(DEFAULT_VALUE.MAX).default(DEFAULT_VALUE.MAX).optional();

const sort = Joi.string().trim().optional().default(DEFAULT_VALUE.sort);

const sortOrder = Joi.string().trim().valid(orderingKeys.ASC, orderingKeys.DESC).optional().default(orderingKeys.DESC);

// for uuid format
const requiredId = Joi.string().required().guid({ version: ID.VERSION });

const optionalId = Joi.string().guid({ version: ID.VERSION });

const pass = Joi.string().regex(password.REGEXP).message(password.MSG).min(password.MINCHAR).max(password.MAXCHAR).required();

const list = Joi.object({
  search,
  page,
  size,
  sort,
  sortOrder
});

const email = Joi.string().email({ minDomainSegments: 2, tlds: { allow: allowedDomains } }).trim().required();

module.exports = { search, page, size, sort, sortOrder, list, requiredId, optionalId, pass, email };
