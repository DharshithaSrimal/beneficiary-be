'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Enrolls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      epi: {
        allowNull: false,
        type: Sequelize.STRING
      },
      nic: {
        allowNull: false,
        type: Sequelize.STRING
      },
      foolhuma: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.STRING
      },
      sex: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Enrolls');
  }
};