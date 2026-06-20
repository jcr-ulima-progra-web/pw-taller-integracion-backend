import usuariosRaw from '../models/usuario.js';

let data = [...usuariosRaw];
let counter = data.length;

const findAll = () => data;

const findOne = (id) => data.find(u => u.id === parseInt(id));

const create = (payload) => {
    payload.id = ++counter;
    data.push(payload);
    return payload;
};

const repository = { findAll, findOne, create };

export default repository;
