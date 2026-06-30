'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      branch_location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // manager_id is intentionally omitted here — added below
      // after both tables exist to break the circular FK dependency
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('departments', ['name'], {
      name: 'departments_name_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the deferred FK before dropping the table
    await queryInterface.removeConstraint(
      'departments',
      'departments_manager_id_fkey'
    ).catch(() => {}); // ignore if it doesn't exist yet

    await queryInterface.dropTable('departments');
  },
};