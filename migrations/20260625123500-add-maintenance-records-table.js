'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenance_records', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      assetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'assets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      maintenanceType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'e.g. Hardware Calibration, Preventive Inspection, Oil & Filter Exchange',
      },
      vendorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      lastServiceDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      nextServiceDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('SCHEDULED', 'PENDING', 'OVERDUE', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('maintenance_records', ['assetId'], {
      name: 'maintenance_records_assetId_idx',
    });

    await queryInterface.addIndex('maintenance_records', ['vendorId'], {
      name: 'maintenance_records_vendorId_idx',
    });

    await queryInterface.addIndex('maintenance_records', ['createdBy'], {
      name: 'maintenance_records_createdBy_idx',
    });

    await queryInterface.addIndex('maintenance_records', ['status', 'nextServiceDate'], {
      name: 'maintenance_records_status_nextServiceDate_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('maintenance_records');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_maintenance_records_status";');
  },
};
