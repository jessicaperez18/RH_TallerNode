const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = express.Router();
const db = require('../config/database');

user.post('/login', async (req, res) => {
    const { email_usuario, password } = req.body;

    if (!(email_usuario && password) || typeof email_usuario !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    try {
        const rows = await db.query(
            'SELECT id_usuario, email_usuario, password, estado FROM usuario WHERE email_usuario = ?',
            [email_usuario.trim().toLowerCase()]
        );

        // Mismo mensaje si el correo no existe o la contraseña falla,
        // para no revelar cuál de los dos fue
        if (rows.length !== 1 || !(await bcrypt.compare(password, rows[0].password))) {
            return res.status(401).json({ code: 401, message: 'Usuario y/o contraseña incorrectos' });
        }

        if (rows[0].estado !== 1) {
            return res.status(403).json({ code: 403, message: 'Usuario inactivo' });
        }

        const token = jwt.sign(
            {
                id_usuario: rows[0].id_usuario,
                email_usuario: rows[0].email_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ code: 200, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});

module.exports = user;