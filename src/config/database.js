import Sequelize from 'sequelize'
import pg from 'pg'

const hostname = 'localhost';
const username = 'postgres';
const password = '1234';
const database = 'partidosdb';
const port = 5432;
const dialect = 'postgres';

const sequelize = new Sequelize(database, username, password, {
    host: hostname,
    port: port,
    dialect: dialect, 
    dialecModule: pg
})

export default sequelize;