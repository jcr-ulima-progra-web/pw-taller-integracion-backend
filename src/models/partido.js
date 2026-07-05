import sequelize from "../config/database.js";
import { DataTypes } from 'sequelize';

const Partido = sequelize.define('partido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    etapa: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    equipo1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    equipo2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    equipo1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pvictoria: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    pempate: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    pderrota: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    marcadorReal: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

export default Partido;