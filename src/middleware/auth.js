import jwt from 'jsonwebtoken';

export const JWT_SECRET = 'zMxNgV1cjUcjKnSCOZykseZaoYvUVPBtYqBOTZmJW2P'

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No se envió token de autenticación.'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado.'
        });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (req.usuario?.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso restringido a administradores.'
        });
    }
    next();
};

export default authMiddleware;