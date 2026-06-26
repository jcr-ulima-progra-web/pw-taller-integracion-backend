import usuarioService from '../services/usuario.js';

const registrar = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;
        const response = await usuarioService.registrar({ nombre, correo, password });
        return res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error inesperado', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const result = await usuarioService.login({ correo, password });
        return res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error inesperado', error: error.message });
    }
};

const listarUsuarios = (req, res) => {
    const usuarios = usuarioService.listarUsuariosConAciertos();
    return res.status(200).json(usuarios);
};

const controller = { registrar, login, listarUsuarios };

export default controller;