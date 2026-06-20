import prediccionesRaw from '../models/prediccion.js';

let data = [...prediccionesRaw];
let counter = data.length;

const findAll = () => data;

const findOne = (id) => data.find(p => p.id === parseInt(id));

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
    create,
    update,
    remove
};

export default repository;
