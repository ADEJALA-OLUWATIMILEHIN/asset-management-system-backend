'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'e.g. Insurance_Policy_2024.pdf',
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fileSizeBytes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      docType: {
        type: Sequelize.ENUM(
          'VEHICLE_INSURANCE',
          'MAINTENANCE_AGREEMENT',
          'COMPLIANCE_CERT',
          'REAL_ESTATE_LEASE',
          'PURCHASE_ORDER'
        ),
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
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Null for PERMANENT documents',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PERMANENT'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      uploadedBy: {
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

    await queryInterface.addIndex('documents', ['linkedAssetId'], {
      name: 'documents_linkedAssetId_idx',
    });

    await queryInterface.addIndex('documents', ['uploadedBy'], {
      name: 'documents_uploadedBy_idx',
    });

    await queryInterface.addIndex('documents', ['docType', 'status'], {
      name: 'documents_docType_status_idx',
    });

    await queryInterface.addIndex('documents', ['expiryDate'], {
      name: 'documents_expiryDate_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documents');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_docType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_status";');
  },
};
