import partidoRepo from '../repositories/partido.js'

const listar = () => partidoRepo.findAll();

const obtener = (id) => partidoRepo.findOne(id);

const registrarMarcadorReal = (id, marcadorReal) => {
    if (
        marcadorReal?.equipo1 === undefined ||
        marcadorReal?.equipo2 === undefined
    ) {
        return { success: false, message: 'Debes enviar el marcador (equipo1, equipo2).' };
    }

    const partido = partidoRepo.setMarcadorReal(id, {
        equipo1: parseInt(marcadorReal.equipo1),
        equipo2: parseInt(marcadorReal.equipo2)
    });

    if (!partido) {
        return { success: false, message: 'Partido no encontrado.' };
    }

    return { success: true, message: 'Marcador registrado.', partido };
};

const partidoService = { listar, obtener, registrarMarcadorReal };

export default partidoService;