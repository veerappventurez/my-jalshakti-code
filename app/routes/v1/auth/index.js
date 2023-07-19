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

 routes.post('/registernew', controller.registernew);
 routes.post('/addComplaint', userController.add_complaint_with_multer);
 routes.post('/viewComplaints', userController.view_complaints_by_user)
module.exports = routes;
