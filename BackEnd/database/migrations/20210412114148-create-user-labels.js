'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserLabels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      label_name: {
        allowNull: false,
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
    }).then(() => {
      return queryInterface.addConstraint('UserLabels',  {
        fields: ['user_id','label_name'],
        type: 'unique',
        name: 'unique_combined_userID&label'
      })
    }).then(() => {
      return queryInterface.addConstraint('UserLabels', {
        type: 'foreign key',
        fields: ['user_id'],
        references: {
          fields: ['id'],
          table: 'Users',
        },
        name: 'UL_users_id_fkey',
      })
    }).then(() => {
      return queryInterface.addConstraint('UserLabels', {
        type: 'foreign key',
        fields: ['label_name'],
        onUpdate: 'CASCADE',
        references: {
          fields: ['label_name'],
          table: 'Labels',
        },
        name: 'UL_labels_name_fkey',
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserLabels');
  }
};