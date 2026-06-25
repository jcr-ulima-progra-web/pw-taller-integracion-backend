import jwt from 'jsonwebtoken'

import { JWT_SECRET } from '../middleware/auth.js'

const generateToken = (id, nombre, correo, rol) => {
    return jwt.sign({id, nombre, correo, rol}, JWT_SECRET, { expiresIn: '7d' });
}

const sanitize = (usuario) => {
    const { password, ...rest } = usuario;
    return rest;
};

const registrar = async ({ nombre, correo, password }) => {
    if (!nombre || !correo || !password) {
        return { success: false, message: 'Proporcione nombre, correo y password.' };
    }

    if (repository.findByCorreo(correo)) {
        return { success: false, message: 'Ya existe un usuario con ese correo.' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = repository.create({
        nombre,
        correo,
        password: hashedPassword,
        rol: 'usuario',
        createdAt: new Date()
    });

const token = generarToken(nuevoUsuario.id, nuevoUsuario.nombre, nuevoUsuario.correo, nuevoUsuario.rol);

    return {
        success: true,
        message: 'Usuario creado exitosamente',
        token,
        usuario: sanitize(nuevoUsuario)
    };
};

const login = async ({ correo, password }) => {
    if (!correo || !password) {
        return { success: false, message: 'Correo o password incorrectos.' };
    }

    const usr = repository.findByCorreo(correo);
    if (!usr) {
        return { success: false, message: 'Correo o password incorrectos.' };
    }

    const isPasswordValid = await bcrypt.compare(password, usr.password);
    if (!isPasswordValid) {
        return { success: false, message: 'Correo o password incorrectos.' };
    }

    const token = generarToken(usr.id, usr.nombre, usr.correo, usr.rol);

    return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        usuario: sanitize(usr)
    };
};

const contarAciertos = (usuarioId) => {
    const predicciones = prediccionRepo.findByUsuario(usuarioId);
    let aciertos = 0;
    let resueltas = 0;
    for (const pred of predicciones) {
        const partido = partidoRepo.findOne(pred.partidoId);
        if (!partido?.marcadorReal) continue;
        resueltas += 1;
        if (
            parseInt(pred.marcadorPredicho.equipo1) === parseInt(partido.marcadorReal.equipo1) &&
            parseInt(pred.marcadorPredicho.equipo2) === parseInt(partido.marcadorReal.equipo2)
        ) {
            aciertos += 1;
        }
    }
    return { totalPredicciones: predicciones.length, resueltas, aciertos };
};

const listarUsuariosConAciertos = () => {
    return repository.findAll().map((u) => ({
        ...sanitize(u),
        ...contarAciertos(u.id)
    }));
};

const usuarioService = { registrar, login, listarUsuariosConAciertos };

export default usuarioService;