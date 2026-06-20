import prediccionService from '../services/prediccion.js';

const listarMias = (req, res) => {
    const predicciones = prediccionService.listarPorUsuario(req.usuario.id);
    return res.status(200).json(predicciones);
};

const obtenerParaPartido = (req, res) => {
    const prediccion = prediccionService.obtenerDeUsuarioParaPartido(req.usuario.id, req.params.partidoId);
    if (!prediccion) {
        return res.status(404).json({ success: false, message: 'Sin predicción para este partido.' });
    }
    return res.status(200).json(prediccion);
};

const guardar = (req, res) => {
    const { partidoId, equipo1, equipo2 } = req.body;
    const result = prediccionService.crearOActualizar(req.usuario.id, partidoId, { equipo1, equipo2 });
    return res.status(result.success ? 200 : 400).json(result);
};

const eliminar = (req, res) => {
    const result = prediccionService.eliminar(req.usuario.id, req.params.id);
    return res.status(result.success ? 200 : 404).json(result);
};

const controller = { listarMias, obtenerParaPartido, guardar, eliminar };

export default controller;
