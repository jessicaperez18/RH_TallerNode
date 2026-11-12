const fs = require('fs');
const db = require('./config/database');

(async () => {
    try {
        const empleado = await db.query(
            'SELECT id_empleado, nombre, apellidos, telefono, email, direccion FROM empleado'
        );
        const usuario = await db.query(
            'SELECT id_usuario, nombre_usuario, email_usuario, estado FROM usuario'
        );

        fs.writeFileSync('rh.json', JSON.stringify({ empleado, usuario }, null, 2), 'utf8');
        console.log('rh.json creado');
    } catch (err) {
        console.error(err);
    } finally {
        db.end();
    }
})();