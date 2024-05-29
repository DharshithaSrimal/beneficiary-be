'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      epi: {
        type: Sequelize.STRING
      },
      nic: {
        type: Sequelize.STRING
      },
      foolhuma: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      vaccine: {
        type: Sequelize.STRING
      },
      center: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Appointments');
  }
};