'use strict';
module.exports = (sequelize, DataTypes) => {
  const Enroll = sequelize.define('Enroll', {
    userId: DataTypes.INTEGER,
    epi: DataTypes.STRING,
    phcId: DataTypes.STRING,
    nic: DataTypes.STRING,
    foolhuma: DataTypes.STRING,
    dob: DataTypes.STRING,
    sex: DataTypes.STRING,
    name: DataTypes.STRING,
    otp: DataTypes.INTEGER
  }, {});
  Enroll.associate = function(models) {
    // associations can be defined here
  };
  return Enroll;
};