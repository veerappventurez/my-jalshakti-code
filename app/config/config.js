// require('dotenv').config();

const { env } = require('../constant/environment');

module.exports = {
  'development': {
    'username': env.DB_USER,
    'password': env.DB_PASSWORD,
    'database': env.DB_NAME,
    'host': env.DB_HOST,
    'dialect': 'postgres',
    'max': 20, // maximum connection which postgresql or mysql can initiate
    'min': 0, // minimum connection which postgresql or mysql can initiate
    'acquire': 20000, // time require to reconnect
    'idle': 20000, // get idle connection
    'evict': 10000 // it actually removes the idle connection
  },
  'test': {
    'username': env.DB_USER,
    'password': env.DB_PASSWORD,
    'database': env.DB_NAME,
    'host': env.DB_HOST,
    'dialect': 'postgres',
    'max': 20, // maximum connection which postgresql or mysql can initiate
    'min': 0, // minimum connection which postgresql or mysql can initiate
    'acquire': 20000, // time require to reconnect
    'idle': 20000, // get idle connection
    'evict': 10000, // it actually removes the idle connection,
    'dialectOptions': {
      'ssl': {
        'require': true, // This will help you. But you will see new error
        'rejectUnauthorized': false // This line will fix new error
      }
    }
  },
  'production': {
    'username': 'postgres',
    'password': 'Vikas@123',
    'database': 'Test',
    'host': 'localhost',
    'dialect': 'postgres',
    'max': 20, // maximum connection which postgresql or mysql can initiate
    'min': 0, // maximum connection which postgresql or mysql can initiate
    'acquire': 20000, // time require to reconnect
    'idle': 20000, // get idle connection
    'evict': 10000 // it actually removes the idle connection
  }
};
