const bcrypt = require('bcrypt');
const db = require('./config/database');

const nombre = 'admin';
const email = 'admin@empresa.com';      
const password = 'TNodeRH23';  

(async () => {
    try {
        const hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO usuario (nombre_usuario, email_usuario, password, estado) VALUES (?, ?, ?, ?)',
            [nombre, email, hash, 1]
        );
        console.log('Usuario administrador creado:', email);
    } catch (err) {
        console.error(err.code === 'ER_DUP_ENTRY' ? 'Ese usuario ya existe' : err);
    } finally {
        db.end();
    }
})();