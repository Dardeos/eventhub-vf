const { Sequelize, DataTypes } = require('sequelize');

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
    })
    : new Sequelize({ dialect: 'sqlite', storage: './db.sqlite3' });

const Event = sequelize.define('Event', {
    title:       { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }, 
    date:        { type: DataTypes.DATE, allowNull: false },
    status:      { type: DataTypes.STRING, defaultValue: 'upcoming' },
    created_at: { 
        type: DataTypes.DATE, 
        defaultValue: Sequelize.NOW 
    }
}, {
    tableName: 'api_event', 
    timestamps: false      
});

const Participant = sequelize.define('Participant', {
    name:  { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false }
}, {
    tableName: 'api_participant',
    timestamps: false
});


const Registration = sequelize.define('Registration', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    event_id: {
        type: DataTypes.INTEGER,
        references: { model: 'api_event', key: 'id' }
    },
    participant_id: {
        type: DataTypes.INTEGER,
        references: { model: 'api_participant', key: 'id' }
    }
}, {
    tableName: 'api_registration',
    timestamps: false
});

Event.belongsToMany(Participant, { 
    through: Registration, 
    foreignKey: 'event_id', 
    otherKey: 'participant_id' 
});
Participant.belongsToMany(Event, { 
    through: Registration, 
    foreignKey: 'participant_id', 
    otherKey: 'event_id' 
});

module.exports = { sequelize, Event, Participant, Registration };