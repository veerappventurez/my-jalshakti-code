const routes = require('express').Router();
const controller = require('../../../controller/auth');

const userController = require('../../../controller/user');
const { verifyAuthToken, verifyToken, reqValidator } = require('../../../middleware');
const schema = require('../../../validation/auth');

routes.post('/login', reqValidator(schema.login), controller.login, controller.createSession);
routes.post('/send-otp', reqValidator(schema.sendOtp), controller.sendOtp);
routes.post('/verify-otp', reqValidator(schema.verifyOtp), verifyToken, controller.verifyOtp);
routes.post('/logout', verifyAuthToken, controller.logout);

routes.post('/register', reqValidator(schema.register), controller.register);

// add the verifyToken after the testing is done
routes.post('/add_complaint', reqValidator(schema.complaint), userController.add_complaint)


// routes.get('/profile/:id', verifyAuthToken, reqValidator(schema.getProfile), controller.getProfile);
// routes.get('/getAllComplaintsByUser', verifyAuthToken, reqValidator(schema.getComplaints), controller.getComplaintsByUser)
// routes.get('/getComplaintStatusById', verifyAuthToken, reqValidator(shema.getComplaints.status), controller.getComplaintStatusById)
// routes.post('/updateProfile', reqValidator(schema.profile), controller.updateProfile)
// statuas gets updated as per the time displayed as the 
// it gets updated 

// to do models create
// register

module.exports = routes;
