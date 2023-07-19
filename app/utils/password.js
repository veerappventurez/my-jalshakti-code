const bcrypt = require('bcrypt');
const { env } = require('../constant/environment');

exports.generateHash = async (password) => {
  try {
    const saltRounds = parseInt(env.SALT_ROUND);
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password.toString(), salt);
    return hash;
  } catch (err) {
    return err;
  }
};
// you can compare hash otp by below function
exports.comparePassword = (password, hash) => bcrypt.compareSync(password, hash);
