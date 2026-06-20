import jwt from 'jsonwebtoken'

import { JWT_SECRET } from '../middleware/auth.js'

const generateToken = (id, nombre, correo, rol) => {
    return jwt.sign({id, nombre, correo, rol}, JWT_SECRET, { expiresIn: '7d' });
}