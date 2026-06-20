import prediccionesRaw from '../models/prediccion.js';

let data = [...prediccionesRaw];
let counter = data.length;

const findAll = () => data;

const findByUsuario = (usuarioId) => data.filter(p => p.usuarioId === parseInt(usuarioId));

const findOne = (id) => data.find(p => p.id === parseInt(id));

const findByUsuarioAndPartido = (usuarioId, partidoId) =>
    data.find(p => p.usuarioId === parseInt(usuarioId) && p.partidoId === parseInt(partidoId));

const findByPartido = (partidoId) => data.filter(p => p.partidoId === parseInt(partidoId));

const create = (payload) => {
    payload.id = ++counter;
    data.push(payload);
    return payload;
};

const update = (payload) => {
    const index = data.findIndex(p => p.id === parseInt(payload.id));
    if (index > -1) {
        data[index] = { ...data[index], ...payload, id: data[index].id };
        return data[index];
    }
    return null;
};

const remove = (id) => {
    const index = data.findIndex(p => p.id === parseInt(id));
    if (index > -1) {
        data.splice(index, 1);
        return true;
    }
    return false;
};

const repository = {
    findAll,
    findOne,
    findByUsuario,
    findByUsuarioAndPartido,
    findByPartido,
    create,
    update,
    remove
};

export default repository;
