const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = express.Router();
const db = require('../config/database');

// Registrar usuario
user.post('/', async (req, res) => {
    const { nombre_usuario, email_usuario, password } = req.body;

    if (!(nombre_usuario && email_usuario && password)) {
        return res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_usuario)) {
        return res.status(400).json({ code: 400, message: 'Correo inválido' });
    }

    if (password.length < 8) {
        return res.status(400).json({ code: 400, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO usuario (nombre_usuario, email_usuario, password, estado)
             VALUES (?, ?, ?, ?)`,
            [nombre_usuario, email_usuario, hash, 1]
        );

        if (result.affectedRows === 1) {
            return res.status(201).json({ code: 201, message: 'Usuario registrado correctamente' });
        }

        return res.status(500).json({ code: 500, message: 'Ocurrió un error' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ code: 409, message: 'El usuario o correo ya existe' });
        }
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});


const bcrypt = require('bcrypt');   // junto a tus otros require

user.post('/login', async (req, res) => {
    const { email_usuario, password } = req.body;

    if (!(email_usuario && password)) {
        return res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    try {
        const rows = await db.query(
            'SELECT id_usuario, email_usuario, password, estado FROM usuario WHERE email_usuario = ?',
            [email_usuario]
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

user.get('/', async (req, res) => {
    try {
        const rows = await db.query(
            'SELECT id_usuario, nombre_usuario, email_usuario, estado FROM usuario'
        );
        return res.status(200).json({ code: 200, data: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});

module.exports = user;