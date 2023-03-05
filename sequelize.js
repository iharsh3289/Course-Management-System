const Sequelize = require('sequelize');
const OTP_Model = require('./models/OTP');

const sequelize = new Sequelize('dbms', 'root', '', {
  host: 'localhost',
  dialect:  'mysql',
  define: {
    timestamps: false
  }
});

const OTP = OTP_Model(sequelize, Sequelize);

sequelize.sync().then(() => {
  console.log('db and tables have been created');
});

module.exports = {OTP};