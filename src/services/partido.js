import partidoRepo from '../repositories/partido.js'

const listar = () => partidoRepo.findAll();

const obtener = (id) => partidoRepo.findOne(id);

export default { listar, obtener}