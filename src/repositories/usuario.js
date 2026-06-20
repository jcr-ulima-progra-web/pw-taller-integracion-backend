import usuariosRaw from '../models/usuario.js';

let data = [...usuariosRaw];
let counter = data.length;

const findAll = () => data;

const findOne = (id) => data.find(u => u.id === parseInt(id));

const findByCorreo = (correo) => data.find(u => u.correo?.toLowerCase() === correo?.toLowerCase());

const create = (payload) => {
    payload.id = ++counter;
    data.push(payload);
    return payload;
};

const repository = { findAll, findOne, findByCorreo, create };

export default repository;
