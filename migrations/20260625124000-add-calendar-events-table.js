'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calendar_events', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'e.g. Ins. Renewal #492',
      },
      eventType: {
        type: Sequelize.ENUM(
          'INSURANCE_RENEWAL',
          'MAINTENANCE_DUE',
          'LICENSE_EXPIRY',
          'AUDIT_SCHEDULE',
          'LEASE_PAYMENT'
        ),
        allowNull: false,
      },
      eventDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      linkedAssetId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'assets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      linkedDocId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      isCritical: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Drives the critical alerts panel',
      },
      isResolved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('calendar_events', ['eventDate'], {
      name: 'calendar_events_eventDate_idx',
    });

    await queryInterface.addIndex('calendar_events', ['eventType', 'isResolved'], {
      name: 'calendar_events_eventType_isResolved_idx',
    });

    await queryInterface.addIndex('calendar_events', ['linkedAssetId'], {
      name: 'calendar_events_linkedAssetId_idx',
    });

    await queryInterface.addIndex('calendar_events', ['linkedDocId'], {
      name: 'calendar_events_linkedDocId_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('calendar_events');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_calendar_events_eventType";');
  },
};
