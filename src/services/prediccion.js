import prediccionRepo from '../repositories/prediccion.js';
import partidoRepo from '../repositories/partido.js';

const calcularAcierto = (prediccion, marcadorReal) => {
    if (!marcadorReal) return null;
    return (
        parseInt(prediccion.equipo1) === parseInt(marcadorReal.equipo1) &&
        parseInt(prediccion.equipo2) === parseInt(marcadorReal.equipo2)
    );
};

const enriquecer = (prediccion) => {
    const partido = partidoRepo.findOne(prediccion.partidoId);
    return {
        ...prediccion,
        partido,
        acerto: calcularAcierto(prediccion.marcadorPredicho, partido?.marcadorReal)
    };
};

const listarPorUsuario = (usuarioId) => {
    return prediccionRepo.findByUsuario(usuarioId).map(enriquecer);
};

const obtenerDeUsuarioParaPartido = (usuarioId, partidoId) => {
    const prediccion = prediccionRepo.findByUsuarioAndPartido(usuarioId, partidoId);
    return prediccion ? enriquecer(prediccion) : null;
};

const crearOActualizar = (usuarioId, partidoId, marcadorPredicho) => {
    if (
        marcadorPredicho?.equipo1 === undefined ||
        marcadorPredicho?.equipo2 === undefined
    ) {
        return { success: false, message: 'Debes enviar el marcador (equipo1, equipo2).' };
    }

    const partido = partidoRepo.findOne(partidoId);
    if (!partido) {
        return { success: false, message: 'Partido no encontrado.' };
    }

    const marcadorLimpio = {
        equipo1: parseInt(marcadorPredicho.equipo1),
        equipo2: parseInt(marcadorPredicho.equipo2)
    };

    let prediccion = prediccionRepo.findByUsuarioAndPartido(usuarioId, partidoId);

    if (prediccion) {
        prediccion = prediccionRepo.update({
            id: prediccion.id,
            marcadorPredicho: marcadorLimpio,
            updatedAt: new Date()
        });
    } else {
        prediccion = prediccionRepo.create({
            usuarioId: parseInt(usuarioId),
            partidoId: parseInt(partidoId),
            marcadorPredicho: marcadorLimpio,
            createdAt: new Date()
        });
    }

    return {
        success: true,
        message: 'Predicción guardada.',
        prediccion: enriquecer(prediccion)
    };
};

const eliminar = (usuarioId, prediccionId) => {
    const prediccion = prediccionRepo.findOne(prediccionId);
    if (!prediccion || prediccion.usuarioId !== parseInt(usuarioId)) {
        return { success: false, message: 'Predicción no encontrada.' };
    }
    prediccionRepo.remove(prediccionId);
    return { success: true, message: 'Predicción eliminada.' };
};

const prediccionService = {
    listarPorUsuario,
    obtenerDeUsuarioParaPartido,
    crearOActualizar,
    eliminar
};

export default prediccionService;
