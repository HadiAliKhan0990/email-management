const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ticketType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalTickets: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    ticketValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: 'ticket',
    timestamps: true,
});

module.exports = Ticket; 