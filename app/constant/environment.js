require('dotenv').config();

const env = {
  PORT: process.env.PORT,
  MONGODB_USER_URI: process.env.MONGODB_USER_URI,
  NODE_ENV: process.env.NODE_ENV,
  API_KEY: process.env.API_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN,
  OTP_DIGIT: process.env.OTP_DIGIT * 1,
  SALT_ROUND: process.env.SALT_ROUND,
  OTP_EXPIRES_IN: process.env.OTP_EXPIRES_IN,
  MAX_LOGIN_DEVICE: process.env.MAX_LOGIN_DEVICE * 1,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST
};

module.exports = { env };
