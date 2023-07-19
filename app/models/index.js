const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const { env } = require('../constant/environment');
const node_env = env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.js'))[node_env];
const db = {};
//he sequelize object is created using the config object,
// which establishes the connection to the database.
const sequelize = new Sequelize(config);


//These lines read the contents of the models directory 
//and dynamically load each model file (ending with .js). 
//For each file, the model is created by calling the file's 
//exported function and passing the sequelize object and 
//Sequelize.DataTypes as arguments. 
//The created model is added to the db object with the model's name as the key.

fs.readdirSync(__dirname).filter(file => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
}).forEach(file => {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

//iterate over each model in the db object and check if it has an associate function. 
//If it does, the associate function is called with the db object as an argument. 
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//This code authenticates the database connection by calling the authenticate method of the sequelize object. 
//If the authentication is successful, a success message is logged. Otherwise, an error message is logged.
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error.message);
  });


//These lines synchronize the models with the database by calling the sync method of the sequelize object. 
//The options { force: true, alter: true, logging: false } are provided to drop and recreate the tables during 
//synchronization if needed. The logging option is set to false to disable logging during synchronization.
// After synchronization, a success message is logged, or an error message is logged if an error occurs.

sequelize.sync({ force: false, alter: false, logging: false })
  .then(() => {
    console.log(`DB_NAME & tables created!`);
  }).catch((error) => {
    console.log('catchError>>>>>>>>', error);
  });
db.sequelize = sequelize;
db.Sequelize = Sequelize;
// console.log('================================,', db);
module.exports = db;
