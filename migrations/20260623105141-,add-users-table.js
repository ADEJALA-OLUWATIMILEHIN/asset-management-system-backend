'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUMs first (PostgreSQL requires this)
    
    await queryInterface.createTable('users', {
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
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      initials: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'),
        allowNull: false,
        defaultValue: 'VIEWER',
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PENDING', 'DEACTIVATED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      two_fa_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      security_clearance: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
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

    // Add index on email for fast lookups
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique',
    });

    // Add index on department_id for join performance
    await queryInterface.addIndex('users', ['department_id'], {
      name: 'users_department_id_idx',
    });

    // Add index on role + status for filtering
    await queryInterface.addIndex('users', ['role', 'status'], {
      name: 'users_role_status_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');


  },
};