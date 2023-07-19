const { v4: uuidv4 } = require('uuid');
const mail = require('nodemailer');

exports.genUUID = () => {
  const uuid = uuidv4();
  return uuid;
};

exports.generateOtp = (digit) => {
  const otp = Math.floor(
    10 ** (digit - 1) + Math.random() * (10 ** (digit - 1) * 9)
  );
  return otp;
};

// eslint-disable-next-line no-undef
transporter = mail.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendMail = (email, sendData, subject, textTemplate) => {
  try {
    // eslint-disable-next-line no-undef
    renderFile(`${appRoot}/public/mailTemplate/${textTemplate}`, sendData, (err, dataTemplate) => {
      if (err) {
        console.log(err);
      } else {
        const mainOptions = {
          from: process.env.SMTP_EMAIL,
          to: email,
          subject,
          html: dataTemplate
        };
        // eslint-disable-next-line no-undef
        transporter.sendMail(mainOptions, (info) => {
          if (err) {
            console.log(err);
            // return callback(err, null);
          }
          console.log(info);
          // return callback(null, info);
        });
      }
    });
  } catch (error) {
    console.log('---Email Error--', error);
    return false;
  }
};

exports.getPagination = (page, size) => {
  const limit = size || 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

exports.getSuccessMsgCode = (req) => {
  let msgCode;
  if (req.url.slice(1) === 'signup') {
    msgCode = 'SIGNUP_SUCCESSFUL';
  } else {
    msgCode = 'LOGIN_SUCCESSFUL';
  }

  return msgCode;
};

exports.getErrorMsgCode = (req) => {
  let msgCode;
  if (req?.url.slice(1) === 'signup') {
    msgCode = 'SIGNUP_FAILED';
  } else {
    msgCode = 'LOGIN_FAILED';
  }

  return msgCode;
};
