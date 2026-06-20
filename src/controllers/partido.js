import partidoService from '../services/partido.js';

const findAll = (req, res) => {
    const partidos = partidoService.listar();
    return res.status(200).json(partidos);
};

const findOne = (req, res) => {
    const partido = partidoService.obtener(req.params.id);
    if (!partido) {
        return res.status(404).json({ success: false, message: 'Partido no encontrado.' });
    }
    return res.status(200).json(partido);
};

const setMarcadorReal = (req, res) => {
    const { equipo1, equipo2 } = req.body;
    const result = partidoService.registrarMarcadorReal(req.params.id, { equipo1, equipo2 });
    return res.status(result.success ? 200 : 400).json(result);
};

const controller = { findAll, findOne, setMarcadorReal };

export default controller;
