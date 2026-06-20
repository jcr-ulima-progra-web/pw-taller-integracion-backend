import partidosRaw from '../models/partido.js';

let data = [...partidosRaw];
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

const setMarcadorReal = (id, marcadorReal) => {
    const partido = findOne(id);
    if (!partido) return null;
    partido.marcadorReal = marcadorReal;
    return partido;
};

const remove = (id) => {
    const index = data.findIndex(p => p.id === parseInt(id));
    if (index > -1) {
        data.splice(index, 1);
        return true;
    }
    return false;
};

const repository = { findAll, findOne, create, update, setMarcadorReal, remove };

export default repository;
