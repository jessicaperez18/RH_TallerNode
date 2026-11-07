const express = require('express');
const rh = express.Router();
const db = require('../config/database');

// Crear un empleado

const COLUMNAS = 'id_empleado, nombre, apellidos, telefono, email, direccion';

// Crear un empleado
rh.post('/', async (req, res) => {
    const { nombre, apellidos, telefono, email, direccion } = req.body;

    if (nombre && apellidos && telefono && email && direccion) {
        try {
            const result = await db.query(
                `INSERT INTO empleado (nombre, apellidos, telefono, email, direccion)
                 VALUES (?, ?, ?, ?, ?)`,
                [nombre, apellidos, telefono, email, direccion]
            );

            if (result.affectedRows === 1) {
                return res.status(201).json({ code: 201, message: 'Empleado registrado correctamente' });
            }

            return res.status(500).json({ code: 500, message: 'Ocurrió un error' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ code: 409, message: 'El correo ya está registrado' });
            }
            console.error(err);
            return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
        }
    }

    return res.status(400).json({ code: 400, message: 'Campos incompletos' });
});

// Listar todos los empleados
rh.get('/', async (req, res) => {
    try {
        const emp = await db.query(`SELECT ${COLUMNAS} FROM empleado`);
        return res.status(200).json({ code: 200, data: emp });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});

// Buscar por nombre (ruta fija: va ANTES de /:id)
rh.get('/buscar/:nombre', async (req, res) => {
    const nombre = req.params.nombre;

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(nombre)) {
        return res.status(400).json({ code: 400, message: 'Nombre inválido' });
    }

    try {
        const emp = await db.query(
            `SELECT ${COLUMNAS} FROM empleado WHERE nombre LIKE ?`,
            [`%${nombre}%`]
        );

        if (emp.length === 0) {
            return res.status(404).json({ code: 404, message: 'Empleado no encontrado' });
        }

        return res.status(200).json({ code: 200, data: emp });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});

// Buscar por ID
rh.get('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) {
        return next();
    }

    try {
        const rows = await db.query(
            `SELECT ${COLUMNAS} FROM empleado WHERE id_empleado = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: 'Empleado no encontrado' });
        }

        return res.status(200).json({ code: 200, data: rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});

// Actualizar todos los campos
rh.put('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) {
        return next();
    }

    const { nombre, apellidos, telefono, email, direccion } = req.body;

    if (nombre && apellidos && telefono && email && direccion) {
        try {
            const result = await db.query(
                `UPDATE empleado
                 SET nombre = ?, apellidos = ?, telefono = ?, email = ?, direccion = ?
                 WHERE id_empleado = ?`,
                [nombre, apellidos, telefono, email, direccion, req.params.id]
            );

            if (result.affectedRows === 1) {
                return res.status(200).json({ code: 200, message: 'Empleado actualizado correctamente' });
            }

            return res.status(404).json({ code: 404, message: 'Empleado no encontrado' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ code: 409, message: 'El correo ya está registrado' });
            }
            console.error(err);
            return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
        }
    }

    return res.status(400).json({ code: 400, message: 'Campos incompletos' });
});

// Actualizar solo los campos enviados
rh.patch('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) {
        return next();
    }

    // Lista blanca de columnas permitidas
    const permitidos = ['nombre', 'apellidos', 'telefono', 'email', 'direccion'];
    const campos = [];
    const valores = [];

    for (const campo of permitidos) {
        if (req.body[campo] !== undefined && req.body[campo] !== '') {
            campos.push(`${campo} = ?`);
            valores.push(req.body[campo]);
        }
    }

    if (campos.length === 0) {
        return res.status(400).json({ code: 400, message: 'Campos incompletos' });
    }

    try {
        valores.push(req.params.id);
        const result = await db.query(
            `UPDATE empleado SET ${campos.join(', ')} WHERE id_empleado = ?`,
            valores
        );

        if (result.affectedRows === 1) {
            return res.status(200).json({ code: 200, message: 'Empleado actualizado correctamente' });
        }

        return res.status(404).json({ code: 404, message: 'Empleado no encontrado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ code: 409, message: 'El correo ya está registrado' });
        }
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});

// Eliminar un empleado
rh.delete('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) {
        return next();
    }

    try {
        const result = await db.query(
            'DELETE FROM empleado WHERE id_empleado = ?',
            [req.params.id]
        );

        if (result.affectedRows === 1) {
            return res.status(200).json({ code: 200, message: 'Empleado borrado correctamente' });
        }

        return res.status(404).json({ code: 404, message: 'Empleado no encontrado' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
});

module.exports = rh;