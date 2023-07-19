const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);


//read the contents of the lng directory and filter out any files that don't have a .json extension
//Then, for each remaining file, it loads the contents using require and assigns them to the lngMsg
// object with the file name (without the extension) as the key.
const lngMsg = {};
fs.readdirSync(path.join(__dirname, 'lng')).filter(file => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-5) === '.json');
}).forEach(file => {
  const fileName = file.slice(0, -5);
  const lng = require(path.join(__dirname, 'lng', file));
  lngMsg[fileName] = lng;
});
//The success function generates a success response. It takes req (request), res (response), result, code, and dbTrans as parameters. 
//It starts by retrieving the language from the request headers (req.headers['accept-language']) or defaulting to 'en' (English) 
//if no language is specified. Then, it constructs a response object with properties such as success, status_code, message, result, and time.
exports.success = async (req, res, result, code, dbTrans) => {
  const lng = req.headers['accept-language'] || 'en';
  try {
    const response = {
      success: true,
      status_code: code,
      // eslint-disable-next-line dot-notation
      message: (lngMsg[lng] ? lngMsg[lng][result.msgCode] : lngMsg['en'][result.msgCode]) || httpStatus[code],
      result: result.data ? result.data : '',
      time: Date.now()
    };
    if (dbTrans !== undefined) {
      await dbTrans.commit();
    }
    return res.status(code).json(response);
  } catch (error) {
    if (dbTrans !== undefined) {
      await dbTrans.rollback();
    }
    return res.json(
      {
        success: true,
        status_code: 500,
        // eslint-disable-next-line dot-notation
        message: lngMsg[lng] ? lngMsg[lng]['INTERNAL_SERVER_ERROR'] : lngMsg['en']['INTERNAL_SERVER_ERROR'],
        result: '',
        time: Date.now()
      });
  }
};

exports.error = async (req, res, error, code, dbTrans) => {
  // console.log("🚀 ~ file: index.js:47 ~ exports.error= ~ error:", error)
  const lng = req.headers['accept-language'] || 'en';
  try {
    const response = {
      success: false,
      status_code: code,
      message: (lngMsg[lng] ? lngMsg[lng][error.msgCode] : lngMsg.en[error.msgCode]) || httpStatus[code],
      result: {
        error: error.data ? error.data : 'error'
      },
      time: Date.now()
    };
    if (dbTrans !== undefined) {
      await dbTrans.rollback();
    }
    res.status(code).json(response);
  } catch (err) {
    if (dbTrans !== undefined) {
      await dbTrans.rollback();
    }
    return res.status(500).json({
      success: false,
      status_code: 500,
      // eslint-disable-next-line dot-notation
      message: lngMsg[lng] ? lngMsg[lng]['INTERNAL_SERVER_ERROR'] : lngMsg['en']['INTERNAL_SERVER_ERROR'],
      result: '',
      time: Date.now()
    });
  }
};
