const Joi = require('joi');
const { DEFAULT_VALUE, otp, phone } = require('../constant/auth');
const { pass, email } = require('./common');

const login = Joi.object({
  email,
  password: Joi.string().required(),
  deviceToken: Joi.string().required(),
  deviceId: Joi.string().required(),
  deviceType: Joi.string().default(DEFAULT_VALUE.DEVICE).optional()
});


const verifyOtp = Joi.object({
  phone_no: Joi.string().length(phone.LENGTH).regex(phone.REGEXP).required(),
  otp: Joi.string().length(otp.LENGTH).message(otp.MSG).required()
});

const sendOtp = Joi.object({
  phone_no: Joi.string().length(phone.LENGTH).regex(phone.REGEXP).required()
});

const forResetPassword = Joi.object({
  newPassword: pass
});

const changePassword = Joi.object({
  oldPassword: pass,
  newPassword: pass,
  logout: Joi.boolean()

});

const forgot = Joi.object({
  email
});

const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  is_email_verified: Joi.boolean().default(false),
 // USER_TYPE: Joi.string().valid(USER_TYPE.ADMIN, USER_TYPE.COMPANY).required(),
  country_code: Joi.string().allow(''),
  phone_no: Joi.string().required(),
  is_phone_verified: Joi.boolean().default(false),
  status: Joi.string().default('0')
});

module.exports = {
  login,
  verifyOtp,
  forResetPassword,
  changePassword,
  forgot,
  sendOtp,
  register
};
