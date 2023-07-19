const response = require('../response');
const path = require('path');
const authJwt = require('../middleware'); //not in use for now
const httpStatus = require('http-status'); 
const passwordHash = require('../utils/password'); //not in use for now
const helper = require('../utils/helper'); //not i use for now
const db = require('../models/index').sequelize;
const { complaints: Complaints } = db.models;

const { env } = require('../constant/environment'); //not in use for now
const { USER_STATUS } = require('../constant/auth'); //not in use for now
const commonService = require('../services/common');
const { Op } = require('sequelize'); //not in use for now
const { condition } = require('sequelize');
const multer = require('multer');

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    cb(null, path.resolve(__dirname, '../uploads/')); // Specify the destination folder where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename for the uploaded file
  }
});

// Create the Multer upload middleware
const upload = multer({ storage: storage }).single('supporting_document');



exports.add_complaint = async (req, res, next) => {
  const dbTrans = await req.db.transaction();

  try {
    const {
        complaint_id,
        complaint_category,
        department_name,
      user_name,
        email,
        phone_no,
      district,
        addressLine1,
        addressLine2,
        supporting_document,
        comment
      
    } = req.body;



    const { Auth, Session } = req.db.models;

    const is_previously = await commonService.findByCondition(Auth, { complaint_id });
   
    
    
    let complaintData;
  
      complaintData = {
        id: complaint_id,
        complaint_category: complaint_category,
        department: department_name,
        name: user_name,
        mobile_no: phone_no,
        email: email,
        district: district,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        document: supporting_document,
        complaint_desc: comment,
      relatedCommentId : null
      };
    
      
      
    

    const complaint_condition = { complaint_id };
    const create_complaint = await commonService.addComplaintDetail(Auth, complaintData, dbTrans);

    // Perform any additional operations or validations here

    await dbTrans.commit();

    return response.success(req, res, { msgCode: 'COMPLAINT_ADDED' }, httpStatus.CREATED);
  } catch (err) {
    console.log(err);
    await dbTrans.rollback();
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
  }
};

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





exports.add_complaint_with_multer = async (req, res) => {
  const dbTrans = await db.transaction();

  try {
    // Handle file upload using multer middleware
    await upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // Handle multer-specific errors
        response.error(req, res, { msgCode: 'FILE_UPLOAD_ERROR' }, httpStatus.BAD_REQUEST);
      } else if (err) {
        // Handle other non-multer errors
        response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
      } else {
        // Extract the uploaded file information from req.file
        const uploadedFile = req.file;

        // Access the file information as needed
        const fileLocation = uploadedFile.path; // Path to the uploaded file on the server

        // Process the complaint data
        const {
          complaint_id,
          complaint_category,
          department_name,
          user_name,
          email,
          phone_no,
          district,
          addressLine1,
          addressLine2,
          comment
        } = req.body;

        const complaintData = {
          complaint_id,
          complaint_category,
          department_name,
          user_name,
          phone_no,
          email,
          district,
          addressLine1,
          addressLine2,
          supporting_document: fileLocation, // Store the file location in your complaint data
          comment,
          relatedCommentId: null
        };

        try {
          const create_complaint = await commonService.addComplaintDetail(Complaints, complaintData, dbTrans);

          // Perform any additional operations or validations here

          await dbTrans.commit();

          response.success(req, res, { msgCode: 'COMPLAINT_ADDED' }, httpStatus.CREATED);
        } catch (err) {
          console.log(err);
          await dbTrans.rollback();
          response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    });
  } catch (err) {
    console.log(err);
    response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
  }

  // next(); // Call next() to pass control to the next middleware or route handler
};


exports.view_complaints_by_user = async (req, res) => {
  const { user_name } = req.body;
  
  try {
    const condition = { user_name }; // Set the condition to filter complaints by user ID

    // Fetch the list of complaints for the user
    const complaints = await commonService.getList(Complaints, condition);
    
    if (complaints) {
      // Send the list of complaints as a response
      console.log(complaints)
      response.success(req, res, { complaints }, httpStatus.OK);
    } else {
      response.error(req, res, { msgCode: 'COMPLAINTS_NOT_FOUND' }, httpStatus.NOT_FOUND);
    }
  } catch (err) {
    console.log(err);
    response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR);
  }
};
