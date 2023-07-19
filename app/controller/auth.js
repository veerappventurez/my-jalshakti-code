const response = require('../response');
const authJwt = require('../middleware');
const httpStatus = require('http-status');
const passwordHash = require('../utils/password');
const helper = require('../utils/helper');
const db = require('../models/index').sequelize;
const { env } = require('../constant/environment');
const { USER_STATUS } = require('../constant/auth');
const commonService = require('../services/common');
const { Op } = require('sequelize');


// middleware function that can be used in an API route handler
exports.login = async (req, res, next) => {
  const dbTrans = await db.transaction();

  try {
    const { email, device_id, device_token, device_type } = req.body;
    const { Auth, Session } = db.models;

    const condition = { email };
// Auth is the table passed as Argument
    const checkUser = await commonService.findByCondition(Auth, condition);
    if (!checkUser) {
      return response.error(req, res, { msgCode: 'INVALID_CREDENTIALS' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    const isLogin = passwordHash.comparePassword(req.body.password, checkUser.password);
    if (!isLogin) {
      return response.error(req, res, { msgCode: 'INVALID_CREDENTIALS' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    // check status if block than return
    if (checkUser.status === USER_STATUS.BLOCK) {
      return response.error(req, res, { msgCode: 'BLOCK_MSG' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    // following code for add limitation of maximum device id

    const totalLogin = await commonService.count(Session, { auth_id: checkUser.id });
    if (totalLogin > (env.MAX_LOGIN_DEVICE * 1)) {
      return response.error(req, res, { msgCode: 'TOTAL_LOGIN' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    const { password, is_phone_verified, is_email_verified, ...resultData } = checkUser;
    resultData.token = authJwt.generateAuthJwt({
      id: checkUser.id,
      USER_TYPE: checkUser.USER_TYPE,
      expires_in: env.TOKEN_EXPIRES_IN,
      email,
      device_id
    });
    if (!resultData.token) {
      return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
    }
    // Passing login data to another middleware
    req.loginData = {
      dbTrans,
      device_details: { device_id, device_token, device_type },
      auth_details: resultData
    };
    return next();
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

exports.createSession = async (req, res) => {
  const { dbTrans } = req.loginData;
  try {
    const { device_id, device_token, device_type } = req.loginData.device_details;
    const condition = { device_id };
    const { Session } = await db.models;
    const checkSession = await commonService.findByCondition(Session, condition);

    if (checkSession) {
      const condition = { id: checkSession.id };
      // for hard delete true is required to pass in delete query
      const destroySession = await commonService.deleteQuery(Session, condition, dbTrans, true);
      if (!destroySession) {
        return response.error(req, res, { msgCode: helper.getErrorMsgCode(req) }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
      }
    }
    const sessionData = {
      id: helper.genUUID(),
      auth_id: req.loginData.auth_details.id,
      device_id,
      device_token,
      device_type,
      jwt_token: req.loginData.auth_details.token
    };
    const createSession = await commonService.addDetail(Session, sessionData, dbTrans);
    if (!createSession) {
      return response.error(req, res, { msgCode: helper.getErrorMsgCode(req) }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
    }

    const { ...data } = req.loginData.auth_details;

    const msgCode = helper.getSuccessMsgCode(req);
    return response.success(req, res, { msgCode, data }, httpStatus.OK, dbTrans);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

exports.sendOtp = async (req, res) => {
  const dbTrans = await db.transaction();

  try {
    const { Otp } = db.models;
    const { phone_no } = req.body;
    const otp = helper.generateOtp(env.OTP_DIGIT);
    const hashOtp = await passwordHash.generateHash(otp);
    const otpData = {
      id: helper.genUUID(),
      user: phone_no,
      otp: hashOtp
    };
    const condition = { user: phone_no };
    const token = authJwt.generateAuthJwt({
      phone_no,
      expires_in: env.OTP_EXPIRES_IN
    });
    const checkOtp = await commonService.findByCondition(Otp, condition);
    if (checkOtp) {
      // if condition match than we update otp in existing row
      const updateData = await commonService.updateData(Otp, { otp: hashOtp }, condition, dbTrans);
      if (!updateData) {
        return response.error(req, res, { msgCode: 'OTP_NOT_SEND' }, httpStatus.FORBIDDEN, dbTrans);
      }
      return response.success(req, res, { msgCode: 'OTP_SENT', data: { token, OTP: otp } }, httpStatus.OK, dbTrans);
    }
    const createOtpDetails = await commonService.addDetail(Otp, otpData, dbTrans);
    if (!createOtpDetails) {
      return response.error(req, res, { msgCode: 'OTP_NOT_SEND' }, httpStatus.FORBIDDEN, dbTrans);
    }
    return response.success(req, res, { msgCode: 'OTP_SENT', data: { token, OTP: otp } }, httpStatus.OK, dbTrans);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

exports.verifyOtp = async (req, res, next) => {
  const dbTrans = await db.transaction();
  try {
    const { Otp } = await db.models;
    const { phone_no, otp } = req.body;
    const condition = { user: phone_no };

    // get data from token
    const { ...tokenData } = req.token;
    if (tokenData.phone_no !== phone_no) {
      return response.error(req, res, { msgCode: 'INVALID_TOKEN' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    const details = await commonService.findByCondition(Otp, condition);
    // console.log('details', details);

    if (!details) {
      return response.error(req, res, { msgCode: 'OTP_EXPIRED' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    const check = passwordHash.comparePassword(otp, details.otp);
    if (!check) {
      return response.error(req, res, { msgCode: 'INVALID_OTP' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    const token = authJwt.generateAuthJwt({
      phone_no,
      is_verified: true,
      expires_in: env.OTP_EXPIRES_IN
    });

    if (!token) {
      return response.error(req, res, { msgCode: 'EMAIL_v_FAILED' }, httpStatus.FORBIDDEN, dbTrans);
    }
    const deleteOtp = await commonService.deleteQuery(Otp, condition, dbTrans, true);
    if (!deleteOtp) {
      return response.error(req, res, { msgCode: 'EMAIL_v_FAILED' }, httpStatus.FORBIDDEN, dbTrans);
    }

    // you can remove 242 to 248 according your requirement because i also use it in case of forgot- password

    if (req.headers.authorization) {
      req.verifyData = {
        phone_no,
        dbTrans
      };
      return next();
    }
    const data = {
      Token: token
    };
    return response.success(req, res, { msgCode: 'EMAIL_VERIFIED', data }, httpStatus.ACCEPTED, dbTrans);
  } catch (error) {
    console.log(error);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

exports.resetPassword = async (req, res) => {
  const dbTrans = await db.transaction();
  try {
    const { Auth } = await db.models;
    const { new_password } = req.body;
    const { ...tokenData } = req.token;
    if (!tokenData.is_verified) {
      return response.error(req, res, { msgCode: 'INVALID_TOKEN' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    const updateCondition = { email: tokenData.email };
    const hashPassword = await passwordHash.generateHash(new_password);
    const data = { password: hashPassword };
    const updateUser = await commonService.updateData(Auth, data, updateCondition);
    if (!updateUser) {
      return response.error(req, res, { msgCode: 'UPDATE_ERROR' }, httpStatus.FORBIDDEN, dbTrans);
    }
    return response.success(req, res, { msgCode: 'PASSWORD_UPDATED' }, httpStatus.CREATED, dbTrans);
  } catch (error) {
    console.log(error);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

// this function is used for check email is exist or not if exist it returns already registered

exports.isEmailExist = async (req, res, next) => {
  try {
    const { Auth } = db.models;

    const { email } = req.body;
    const condition = { email: email.toLowerCase() };
    const checkUserExist = await commonService.findByCondition(Auth, condition);
    if (!checkUserExist) {
      return next();
    }
    return response.error(req, res, { msgCode: 'ALREADY_REGISTERED' }, httpStatus.CONFLICT);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
  }
};

// this function is used for check phone no is exist or not if exist it returns already registered

exports.isPhoneExist = async (req, res, next) => {
  try {
    const { Auth } = db.models;
    const { country_code, phone_no } = req.body;
    const condition = { country_code, phone_no };
    const checkPhone = await commonService.findByCondition(Auth, condition);
    if (!checkPhone) { return next(); }
    return response.error(req, res, { msgCode: 'ALREADY_REGISTERED' }, httpStatus.CONFLICT);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
  }
};

// this function is used for check email is exist or not if not it return unauthorized

exports.isUserExist = async (req, res, next) => {
  try {
    const { Auth } = db.models;
    const { email } = req.body;
    const condition = { email: email.toLowerCase() };
    const checkUserExist = await commonService.findByCondition(Auth, condition);
    if (!checkUserExist) {
      return response.error(req, res, { msgCode: 'UNAUTHORIZED' }, httpStatus.UNAUTHORIZED);
    }
    return next();
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
  }
};

exports.changePassword = async (req, res) => {
  const dbTrans = await db.transaction();

  try {
    const { ...tokenData } = req.data;
    // Below we require model
    const { Auth, Session } = db.models;

    const { new_password, old_password, logout } = req.body;
    const condition = { id: tokenData.id };
    const userDetails = await commonService.findByCondition(Auth, condition);
    if (!userDetails) {
      return response.error(req, res, { msgCode: 'UPDATE_ERROR' }, httpStatus.FORBIDDEN, dbTrans);
    }
    // check old password is correct or not
    const check = passwordHash.comparePassword(old_password, userDetails.password);
    if (!check) {
      return response.error(req, res, { msgCode: 'WRONG_PASS' }, httpStatus.UNAUTHORIZED, dbTrans);
    }
    const hashPassword = await passwordHash.generateHash(new_password);
    const data = {
      password: hashPassword
    };
    const updateUser = await commonService.updateData(Auth, data, condition);
    if (!updateUser) {
      return response.error(req, res, { msgCode: 'UPDATE_ERROR' }, httpStatus.FORBIDDEN, dbTrans);
    }

    // if user want to logout all other device than pass logout true

    if (logout) {
      const sessionCondition = {
        [Op.and]: [{ auth_id: tokenData.id }, { device_id: { [Op.ne]: tokenData.device_id } }]
      };
      await commonService.deleteQuery(Session, sessionCondition, dbTrans, true);
    }
    return response.success(req, res, { msgCode: 'PASSWORD_UPDATED' }, httpStatus.OK, dbTrans);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

exports.logout = async (req, res) => {
  const dbTrans = await db.transaction(); // Creating database transaction
  try {
    // auth id we get from token
    const condition = {
      auth_id: req.data.id,
      device_id: req.data.device_id
    };
    const { Session } = await db.models;
    const destroySession = await commonService.deleteQuery(Session, condition, dbTrans, true);
    if (!destroySession) {
      return response.error(req, res, { msgCode: 'USER_NOT_FOUND' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
    }
    return response.success(req, res, { msgCode: 'LOGOUT_SUCCESSFUL' }, httpStatus.OK, dbTrans);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};


//added new code for signup

exports.register = async (req, res) => {
  const dbTrans = await db.transaction();

  try {
    const {id , email, password, USER_TYPE, country_code, phone_no } = req.body;
    const { Auth } = db.models;

    // Check if the email is already registered
    const emailCondition = { email: email.toLowerCase() };
    const checkEmailExist = await commonService.findByCondition(Auth, emailCondition);
    if (checkEmailExist) {
      return response.error(req, res, { msgCode: 'EMAIL_ALREADY_REGISTERED' }, httpStatus.CONFLICT, dbTrans);
    }

    // Check if the phone number is already registered
    const phoneCondition = { country_code, phone_no };
    const checkPhoneExist = await commonService.findByCondition(Auth, phoneCondition);
    if (checkPhoneExist) {
      return response.error(req, res, { msgCode: 'PHONE_ALREADY_REGISTERED' }, httpStatus.CONFLICT, dbTrans);
    }

    // Generate a hashed password
    const hashedPassword = await passwordHash.generateHash(password);

    // Create the user data
    const userData = {
      id: id,
      email: email.toLowerCase(),
      password: hashedPassword,
      is_email_verified: false,
      USER_TYPE,
      country_code,
      phone_no,
      is_phone_verified: false,
      status: USER_STATUS.ACTIVE
    };

    // Add the user to the Auth table
    const createUser = await commonService.addDetail(Auth, userData, dbTrans);
    if (!createUser) {
      return response.error(req, res, { msgCode: 'USER_REGISTRATION_FAILED' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
    }

    return response.success(req, res, { msgCode: 'USER_REGISTERED_LOGIN' }, httpStatus.CREATED, dbTrans);
  
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};






exports.registernew = async (req, res) => {
  const dbTrans = await db.transaction();

  try {
    const { id, email, password, USER_TYPE, country_code, phone_no } = req.body;
    
    const { Auth } = db.models;

    // Check if the email is already registered
    const emailCondition = { email: email.toLowerCase() };
    const checkEmailExist = await commonService.findByCondition(Auth, emailCondition);
    if (checkEmailExist) {
      return response.error(req, res, { msgCode: 'EMAIL_ALREADY_REGISTERED' }, httpStatus.CONFLICT, dbTrans);
    }

    // Check if the phone number is already registered
    const phoneCondition = { country_code, phone_no };
    const checkPhoneExist = await commonService.findByCondition(Auth, phoneCondition);
    if (checkPhoneExist) {
      return response.error(req, res, { msgCode: 'PHONE_ALREADY_REGISTERED' }, httpStatus.CONFLICT, dbTrans);
    }

    // Generate a hashed password
    const hashedPassword = await passwordHash.generateHash(password);

    // Create the user data
    const userData = {
      id: id,
      email: email.toLowerCase(),
      password: hashedPassword,
      is_email_verified: false,
      USER_TYPE,
      country_code,
      phone_no,
      is_phone_verified: false,
      status: USER_STATUS.ACTIVE
    };

    // Add the user to the Auth table
    const createUser = await commonService.addDetail(Auth, userData, dbTrans);
    if (!createUser) {
      return response.error(req, res, { msgCode: 'USER_REGISTRATION_FAILED' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
    }

    // Send OTP to the user's phone number
    const otp = helper.generateOtp(env.OTP_DIGIT);
    const hashOtp = await passwordHash.generateHash(otp);

    const { Otp } = db.models;
    const otpData = {
      id: helper.genUUID(),
      user: phone_no,
      otp: hashOtp
    };

    const condition = { user: phone_no };
    const checkOtp = await commonService.findByCondition(Otp, condition);
    if (checkOtp) {
      // If a matching OTP record exists, update the OTP in the existing row
      const updateData = await commonService.updateData(Otp, { otp: hashOtp }, condition, dbTrans);
      if (!updateData) {
        return response.error(req, res, { msgCode: 'OTP_NOT_SEND' }, httpStatus.FORBIDDEN, dbTrans);
      }
    } else {
      // If no matching OTP record exists, create a new OTP record
      const createOtpDetails = await commonService.addDetail(Otp, otpData, dbTrans);
      if (!createOtpDetails) {
        return response.error(req, res, { msgCode: 'OTP_NOT_SEND' }, httpStatus.FORBIDDEN, dbTrans);
      }
    }

    // Generate an authentication token for the user
    const token = authJwt.generateAuthJwt({
      phone_no,
      is_verified: false,
      expires_in: env.OTP_EXPIRES_IN
    });

    // Return the success response with the token and OTP
    return response.success(req, res, { msgCode: 'USER_REGISTERED_LOGIN', data: { token, OTP: otp } }, httpStatus.CREATED, dbTrans);
  } catch (err) {
    console.log(err);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

exports.verifyOtp = async (req, res, next) => {
  const dbTrans = await db.transaction();
  try {
    const { Otp } = await db.models;
    const { phone_no, otp } = req.body;
    const condition = { user: phone_no };

    // Get data from the token
    const { ...tokenData } = req.token;
    if (tokenData.phone_no !== phone_no) {
      return response.error(req, res, { msgCode: 'INVALID_TOKEN' }, httpStatus.UNAUTHORIZED, dbTrans);
    }

    const details = await commonService.findByCondition(Otp, condition);
    if (!details) {
      return response.error(req, res, { msgCode: 'OTP_EXPIRED' }, httpStatus.UNAUTHORIZED, dbTrans);
    }

    const check = passwordHash.comparePassword(otp, details.otp);
    if (!check) {
      return response.error(req, res, { msgCode: 'INVALID_OTP' }, httpStatus.UNAUTHORIZED, dbTrans);
    }

    // Update the user's phone verification status
    const { Auth } = db.models;
    const updateCondition = { phone_no };
    const updateData = { is_phone_verified: true };
    const updateUser = await commonService.updateData(Auth, updateData, updateCondition, dbTrans);
    if (!updateUser) {
      return response.error(req, res, { msgCode: 'UPDATE_ERROR' }, httpStatus.FORBIDDEN, dbTrans);
    }

    // Generate an authentication token for the user
    const token = authJwt.generateAuthJwt({
      phone_no,
      is_verified: true,
      expires_in: env.OTP_EXPIRES_IN
    });

    if (!token) {
      return response.error(req, res, { msgCode: 'EMAIL_v_FAILED' }, httpStatus.FORBIDDEN, dbTrans);
    }

    // Delete the OTP record from the database
    const deleteOtp = await commonService.deleteQuery(Otp, condition, dbTrans, true);
    if (!deleteOtp) {
      return response.error(req, res, { msgCode: 'EMAIL_v_FAILED' }, httpStatus.FORBIDDEN, dbTrans);
    }

    // Return the success response with the authentication token
    const data = {
      Token: token
    };
    return response.success(req, res, { msgCode: 'EMAIL_VERIFIED', data }, httpStatus.ACCEPTED, dbTrans);
  } catch (error) {
    console.log(error);
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans);
  }
};

// Other functions remain the same...
