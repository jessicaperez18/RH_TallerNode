# RH_TallerNode
# RH Taller Node

Sistema de administración de empleados para el departamento de Recursos Humanos de **Taller de Node.js S.A. de C.V.**, desarrollado como proyecto final del Taller Especializado de Node.js.

Reemplaza el documento de Excel donde se almacenaban los datos de los empleados por una aplicación web con base de datos, donde solo los usuarios dados de alta directamente en la base de datos pueden iniciar sesión y administrar la información.

## Características

- Inicio de sesión que solo permite el acceso a usuarios existentes en la base de datos.
- Autenticación con **JWT** (algoritmo HS256, vigencia de 1 hora).
- Contraseñas almacenadas con hash **bcrypt**.
- Todas las rutas de empleados están protegidas: sin token válido responden `401`.
- Administración de empleados:
  - Agregar empleados
  - Consultar el listado de empleados
  - Modificar los datos de un empleado
  - Eliminar empleados
  - Buscar empleados por nombre
- Interfaz web con Bootstrap 4.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Servidor | Node.js, Express 5 |
| Base de datos | MySQL / MariaDB (paquete `mysql`) |
| Autenticación | `jsonwebtoken`, `bcrypt` |
| Configuración | `dotenv`, `cors` |
| Frontend | HTML, JavaScript, Bootstrap 4.3.1, Axios |

## Estructura del proyecto

```
RH_TallerNode/
├── config/
│   └── database.js        # Pool de conexiones a MySQL
├── middleware/
│   └── auth.js            # Verificación del token JWT
├── routes/
│   ├── user.js            # Login y gestión de usuarios (/usuarios)
│   └── rh.js              # CRUD y búsqueda de empleados (/empleados)
├── RH/                    # Interfaz de usuario
│   ├── index.html         # Redirige según exista sesión
│   ├── login.html
│   ├── rh.html            # Pantalla principal de empleados
│   └── js/                # login.js, rh.js
├── crear-admin.js         # Script para dar de alta un usuario administrador
├── rh.sql                 # Estructura de la base de datos
├── index.js               # Punto de entrada del servidor
├── package.json
└── .env                   # Variables de entorno (no se sube al repositorio)
```

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- MySQL o MariaDB (por ejemplo, el incluido en XAMPP)

## Instalación y ejecución

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/jessicaperez18/RH_TallerNode.git
cd RH_TallerNode
npm install
```

### 2. Crear la base de datos

Importa el archivo `rh.sql`. Desde la terminal:

```bash
mysql -u root -p < rh.sql
```

O impórtalo desde phpMyAdmin. Esto crea la base de datos `rh` con las tablas `empleado` y `usuario`.

### 3. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
JWT_SECRET=una_clave_larga_y_aleatoria
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rh
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (3000 por defecto) |
| `JWT_SECRET` | Clave con la que se firman los tokens. **Obligatoria**: el servidor no arranca sin ella |
| `DB_HOST` | Servidor de la base de datos |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `DB_NAME` | Nombre de la base de datos (`rh`) |

Para generar una clave segura:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Crear el usuario administrador

Los usuarios se dan de alta directamente en la base de datos; la aplicación no tiene registro de usuarios. Al importar `rh.sql` se crea un administrador inicial:

| Campo | Valor |
|---|---|
| Correo | `admin@empresa.com` |
| Contraseña | `RhAdmin2026` |

Para agregar otro administrador (la contraseña se guarda cifrada con bcrypt):

```bash
node crear-admin.js <nombre> <correo> <contraseña>
```
### 5. Iniciar el servidor

```bash
npm start        # producción
npm run dev      # desarrollo, con reinicio automático (nodemon)
```

El servidor queda disponible en `http://localhost:3000`.

### 6. Abrir la interfaz

Abre `RH/login.html` desde un servidor estático (por ejemplo, la extensión *Live Server* de VS Code) e inicia sesión con el usuario creado en el paso 4.

## API

Todas las respuestas son JSON. Las rutas protegidas requieren el encabezado:

```
Authorization: Bearer <token>
```

### Autenticación

| Método | Ruta | Descripción | Protegida |
|---|---|---|---|
| POST | `/usuarios/login` | Inicia sesión y devuelve el token | No |

Cuerpo de la petición:

```json
{ "email_usuario": "admin@empresa.com", "password": "tu_contraseña" }
```

Respuesta exitosa:

```json
{ "code": 200, "token": "eyJhbGciOi..." }
```

### Empleados

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/empleados` | Lista todos los empleados |
| GET | `/empleados/:id` | Consulta un empleado por su id |
| GET | `/empleados/buscar/:nombre` | Busca empleados por nombre (coincidencia parcial) |
| POST | `/empleados` | Agrega un empleado |
| PUT | `/empleados/:id` | Modifica todos los datos de un empleado |
| PATCH | `/empleados/:id` | Modifica solo los campos enviados |
| DELETE | `/empleados/:id` | Elimina un empleado |

Cuerpo para `POST` y `PUT`:

```json
{
  "nombre": "Ana",
  "apellidos": "López Cruz",
  "telefono": "7191234567",
  "email": "ana@empresa.com",
  "direccion": "Calle Hidalgo 12"
}
```

### Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Registro creado |
| 400 | Datos incompletos o inválidos |
| 401 | Token ausente, inválido o vencido, o credenciales incorrectas |
| 403 | Usuario inactivo |
| 404 | Recurso no encontrado |
| 409 | Registro duplicado |
| 500 | Error interno del servidor |

## Modelo de datos

**empleado**

| Campo | Descripción |
|---|---|
| `id_empleado` | Llave primaria, autoincremental |
| `nombre` | Nombre del empleado |
| `apellidos` | Apellidos |
| `telefono` | Teléfono |
| `email` | Correo electrónico |
| `direccion` | Dirección |

**usuario**

| Campo | Descripción |
|---|---|
| `id_usuario` | Llave primaria, autoincremental |
| `nombre_usuario` | Nombre del usuario |
| `email_usuario` | Correo con el que inicia sesión |
| `password` | Contraseña cifrada con bcrypt |
| `estado` | `1` = activo, `0` = inactivo |

## Seguridad

- Las consultas SQL usan parámetros para evitar inyección SQL.
- El login devuelve el mismo mensaje si el correo no existe o la contraseña es incorrecta.
- El token se verifica en cada petición a rutas protegidas y se limita al algoritmo HS256.
- El archivo `.env` está excluido del repositorio mediante `.gitignore`.

## Despliegue

- **URL en producción:** _pendiente de agregar_
- **Plataforma:** _pendiente de agregar_

Variables de entorno que debes configurar en la plataforma de despliegue: `PORT` (la asigna la plataforma), `JWT_SECRET`, `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`.

## Autora

_Jessica Pérez Carapia_