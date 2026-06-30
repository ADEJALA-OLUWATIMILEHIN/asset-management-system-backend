'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add manager_id column to departments
    await queryInterface.addColumn('departments', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'branch_location', // ignored by PostgreSQL, useful for MySQL
    });

    // Now both tables exist — safe to add the FK
    await queryInterface.addConstraint('departments', {
      fields: ['manager_id'],
      type: 'foreign key',
      name: 'departments_manager_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('departments', ['manager_id'], {
      name: 'departments_manager_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'departments',
      'departments_manager_id_fkey'
    );
    await queryInterface.removeIndex('departments', 'departments_manager_id_idx');
    await queryInterface.removeColumn('departments', 'manager_id');
  },
};