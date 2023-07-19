const app = require('express')();
app.use('/v1', require('./v1'));

module.exports = app;
