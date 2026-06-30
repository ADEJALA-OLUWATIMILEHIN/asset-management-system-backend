'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('assets', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      assetCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Human-readable ID e.g. VHC-2023-001',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM(
          'VEHICLES',
          'EQUIPMENT',
          'REAL_ESTATE',
          'IT_INFRASTRUCTURE',
          'HEAVY_MACHINERY',
          'CORPORATE_FLEET'
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          'ACTIVE',
          'EXPIRED',
          'EXPIRING_SOON',
          'DECOMMISSIONED',
          'PENDING_APPROVAL'
        ),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      manufacturer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      modelYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      purchaseDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      purchasePrice: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      warrantyExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      vendorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      custodianId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      condition: {
        type: Sequelize.ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR'),
        allowNull: true,
      },
      conditionScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '0-100 health percentage',
      },
      insurancePolicyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      valuation: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      lastScannedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      imageUrls: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      mapCoordinates: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '{ lat: number, lng: number }',
      },
      riskLevel: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: true,
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

    await queryInterface.addIndex('assets', ['assetCode'], {
      unique: true,
      name: 'assets_assetCode_unique',
    });

    await queryInterface.addIndex('assets', ['serialNumber'], {
      unique: true,
      name: 'assets_serialNumber_unique',
    });

    await queryInterface.addIndex('assets', ['category', 'status'], {
      name: 'assets_category_status_idx',
    });

    await queryInterface.addIndex('assets', ['departmentId'], {
      name: 'assets_departmentId_idx',
    });

    await queryInterface.addIndex('assets', ['custodianId'], {
      name: 'assets_custodianId_idx',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('assets');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_condition";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_riskLevel";');
  }
};
