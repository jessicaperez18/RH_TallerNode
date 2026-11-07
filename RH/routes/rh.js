const express = require('express');
const rh = express.Router();
const db = require('../config/database');

const MAX_EMP_ID = 10000;
// Crear un empleado
rh.post("/", async (req, res, next) => {
    const { nombre, apellidos, telefono, email, direccion } = req.body;

    if (nombre && apellidos && telefono && email && direccion) {
        try {
            const query = `INSERT INTO empleado 
                (nombre, apellidos, telefono, email, direccion) 
                VALUES (?, ?, ?, ?, ?)`;
            const rows = await db.query(query, [
                nombre, apellidos, telefono, email, direccion
            ]);

            if (rows.affectedRows == 1) {
                return res.status(201).json({ code: 201, message: "Empleado registrado correctamente" });
            }

            return res.status(500).json({ code: 500, message: "Ocurrió un error" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ code: 500, message: "Error en el servidor" });
        }
    }

    return res.status(400).json({ code: 400, message: "Campos incompletos" });
});

rh.delete("/:id", async (req, res, next) => {
    if (!/^[0-9]+$/.test(req.params.id)) {
        return next();
    }

    try {
        const [result] = await db.query(
            "DELETE FROM empleado WHERE id_empleado = ?",
            [req.params.id]
        );

        if (result.affectedRows === 1) {
            return res.status(200).json({ code: 200, message: "Empleado borrado correctamente" });
        }
        return res.status(404).json({ code: 404, message: "Empleado no encontrado" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: "Error interno del servidor" });
    }
});

rh.put("/:id", async (req, res, next) => {
    if (!/^[0-9]{1,3}$/.test(req.params.id)) {
        return next();
    }

    const { pok_name, pok_height, pok_weight, pok_base_experience } = req.body;

    if (pok_name && pok_height && pok_weight && pok_base_experience) {
        let query = `UPDATE pokemon SET pok_name='${pok_name}', pok_height=${pok_height},`;
        query += `pok_weight=${pok_weight},pok_base_experience=${pok_base_experience} WHERE pok_id = ${req.params.id};`;

        const rows = await db.query(query);

        if (rows.affectedRows == 1) {
            return res.status(200).json({ code: 200, message: "Pokemon actualizado correctamente" });
        }

        return res.status(500).json({ code: 500, message: "Ocurrió un error" });
    }
    return res.status(500).json({ code: 500, message: "Campos incompletos" });

});

rh.patch("/:id", async (req, res, next) => {
    if (!/^[0-9]{1,3}$/.test(req.params.id)) {
        return next();
    }

    if (req.body.pok_name) {

        let query = `UPDATE pokemon SET pok_name='${req.body.pok_name}' WHERE pok_id=${req.params.id}`;


        const rows = await db.query(query);

        if (rows.affectedRows == 1) {
            return res.status(200).json({ code: 200, message: "Pokemon actualizado correctamente" });
        }
        return res.status(500).json({ code: 500, message: "Ocurrió un error" });
    }
    return res.status(500).json({ code: 500, message: "Campos incompletos" });
});

// Listar todos los pokemon
rh.get('/', async (req, res, next) => {
    try {
        const pkmn = await db.query('SELECT * FROM pokemon');
        return res.status(200).json({ code: 200, message: pkmn });
    } catch (err) {
        return next(err);
    }
});

// Buscar por ID numérico
rh.get('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) {
        return next();
    }

    const id = Number(req.params.id);

    if (id < 1 || id > MAX_POKEMON_ID) {
        return res.status(404).json({ code: 404, message: 'Pokemon no encontrado' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM pokemon WHERE pok_id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: 'Pokemon no encontrado' });
        }

        return res.status(200).json({ code: 200, message: rows[0] });
    } catch (err) {
        return next(err);
    }
});

// Buscar por nombre (solo letras)
rh.get('/:name', async (req, res, next) => {
    const name = req.params.name;

    if (!/^[A-Za-z]+$/.test(name)) {
        return next();
    }

    try {
        const pkmn = await db.query('SELECT * FROM pokemon WHERE pok_name = ?', [name]); // ✅

        if (!pkmn || pkmn.length === 0) {
            return res.status(404).json({ code: 404, message: 'Pokemon no encontrado' });
        }

        return res.status(200).json({ code: 1, message: pkmn });
    } catch (err) {
        return next(err);
    }
});

module.exports = pokemon;