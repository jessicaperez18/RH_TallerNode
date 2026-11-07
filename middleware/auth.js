const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        const [tipo, token] = header.split(' ');

        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({ code: 401, message: 'Token requerido' });
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        return next();
    } catch (error) {
        return res.status(401).json({ code: 401, message: 'Token inválido o expirado' });
    }
};