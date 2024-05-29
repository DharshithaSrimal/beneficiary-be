'use strict';
module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    user_id: DataTypes.INTEGER,
    epi: DataTypes.STRING,
    nic: DataTypes.STRING,
    foolhuma: DataTypes.STRING,
    date: DataTypes.DATE,
    vaccine: DataTypes.STRING,
    center: DataTypes.STRING,
    status: DataTypes.STRING,
    otp: DataTypes.STRING
  }, {});
  Appointment.associate = function(models) {
    // associations can be defined here
  };
  return Appointment;
};