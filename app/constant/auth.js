const { env } = require('./environment');

const USER_TYPE = {
  COMPANY: 'COMPANY',
  ADMIN: 'ADMIN'
  /*
  Please define here other constant related to user type
  */
};

const USER_STATUS = {
  BLOCK: 'block',
  UNBLOCK: 'unblock'
  /*
  Please define here other constant related to user status
  */
};

const JWT_ERROR = {
  EXPIRED: 'jwt expired',
  INVALID: 'invalid signature'
  /*
  Please define here other constant related to JWT
  */
};

const DEFAULT_VALUE = {
  DEVICE: 'web',
  MIN: 1,
  MAX: 10,
  sort: 'createdAt'
  /*
  Please define here other constant related to default value
  */
};

const password = {
  REGEXP: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  MSG: 'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character',
  MINCHAR: 8,
  MAXCHAR: 20
  /*
  Please define here other constant related to password
  */
};

const otp = {
  MSG: `Otp should be of ${env.OTP_DIGIT} digits`,
  LENGTH: Number(env.OTP_DIGIT)
  /*
  Please define here other constant related to otp
  */
};

const ID = {
  LENGTH: 36,
  VERSION: 'uuidv4'
  /*
  Please define here other constant related to unique id and
  if id data type != uuid in your project you can remove from here
  */
};

const phone = {
  LENGTH: 10,
  REGEXP: /^\d{10}$/
  /*
  Please define other constant related to phone
  */
};

// Please define domain according to project
const allowedDomains = ['com', 'net', 'in', 'co'];

module.exports = { USER_TYPE, USER_STATUS, JWT_ERROR, password, DEFAULT_VALUE, otp, ID, phone, allowedDomains };
