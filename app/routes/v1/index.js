const app = require('express')();
const { verifyApiKey } = require('../../middleware/auth');

const swaggerroutesV1 = require('./swagger/index');
app.use('/', swaggerroutesV1);
app.use(verifyApiKey);
app.use('/auth', require('./auth'));

module.exports = app;
