window.onload = init;

var url = "http://localhost:3000";
var config = {};
var empleados = [];

function init() {
    var token = localStorage.getItem("token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    config = { headers: { 'Authorization': "Bearer " + token } };

    document.getElementById("btn-logout").addEventListener("click", cerrarSesion);
    document.getElementById("form-buscar").addEventListener("submit", buscar);
    document.getElementById("btn-limpiar").addEventListener("click", function () {
        document.getElementById("input-buscar").value = "";
        loadEmpleado();
    });
    document.getElementById("btn-nuevo").addEventListener("click", function () {
        abrirFormulario(null);
    });
    document.getElementById("btn-cancelar").addEventListener("click", cerrarFormulario);
    document.getElementById("form-empleado").addEventListener("submit", guardar);

    loadEmpleado();
}

function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.replace("login.html");
}

// Maneja errores de cualquier petición
function manejarError(err, mensaje) {
    if (err.response && err.response.status === 401) {
        cerrarSesion();   // token vencido o inválido
        return;
    }

    console.error(err);

    if (!err.response) {
        alert("No se pudo conectar con el servidor");
    } else if (err.response.status === 400 || err.response.status === 409) {
        alert(err.response.data.message);
    } else {
        alert(mensaje);
    }
}

//Consultar los datos de un empleado

function loadEmpleado() {
    axios.get(url + "/empleados", config).then(function (res) {
        mostrarEmpleados(res.data.data);
    }).catch(function (err) {
        manejarError(err, "No se pudieron cargar los empleados");
    });
}

// Buscar un empleado por su nombre

function buscar(e) {
    e.preventDefault();

    var nombre = document.getElementById("input-buscar").value.trim();

    if (!nombre) {
        loadEmpleado();
        return;
    }

    axios.get(url + "/empleados/buscar/" + encodeURIComponent(nombre), config)
        .then(function (res) {
            mostrarEmpleados(res.data.data);
        }).catch(function (err) {
            // 404 = sin coincidencias, no es un error
            if (err.response && err.response.status === 404) {
                mostrarEmpleados([]);
                return;
            }
            manejarError(err, "No se pudo realizar la búsqueda");
        });
}

// Mostrar una tabla con los empleados

function mostrarEmpleados(lista) {
    empleados = lista;

    var tbody = document.getElementById("tabla-empleados");
    tbody.textContent = "";

    document.getElementById("mensaje-vacio").style.display = lista.length === 0 ? "block" : "none";

    lista.forEach(function (emp) {
        var fila = document.createElement("tr");

        [emp.nombre, emp.apellidos, emp.telefono, emp.email, emp.direccion].forEach(function (valor) {
            var celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        var acciones = document.createElement("td");

        var btnEditar = document.createElement("button");
        btnEditar.className = "btn btn-outline-primary btn-sm mr-1";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", function () {
            abrirFormulario(emp);
        });

        var btnEliminar = document.createElement("button");
        btnEliminar.className = "btn btn-outline-danger btn-sm";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", function () {
            eliminar(emp);
        });

        acciones.appendChild(btnEditar);
        acciones.appendChild(btnEliminar);
        fila.appendChild(acciones);

        tbody.appendChild(fila);
    });
}

// Form para editar un empleado

function abrirFormulario(emp) {
    document.getElementById("titulo-formulario").textContent = emp ? "Editar empleado" : "Agregar empleado";

    document.getElementById("emp-id").value = emp ? emp.id_empleado : "";
    document.getElementById("emp-nombre").value = emp ? emp.nombre : "";
    document.getElementById("emp-apellidos").value = emp ? emp.apellidos : "";
    document.getElementById("emp-telefono").value = emp ? emp.telefono : "";
    document.getElementById("emp-email").value = emp ? emp.email : "";
    document.getElementById("emp-direccion").value = emp ? emp.direccion : "";

    document.getElementById("panel-formulario").style.display = "block";
    document.getElementById("emp-nombre").focus();
}

function cerrarFormulario() {
    document.getElementById("form-empleado").reset();
    document.getElementById("emp-id").value = "";
    document.getElementById("panel-formulario").style.display = "none";
}

// Agregar o modificar un empleado

function guardar(e) {
    e.preventDefault();

    var id = document.getElementById("emp-id").value;
    var datos = {
        nombre: document.getElementById("emp-nombre").value.trim(),
        apellidos: document.getElementById("emp-apellidos").value.trim(),
        telefono: document.getElementById("emp-telefono").value.trim(),
        email: document.getElementById("emp-email").value.trim(),
        direccion: document.getElementById("emp-direccion").value.trim()
    };

    if (!datos.nombre || !datos.apellidos || !datos.telefono || !datos.email || !datos.direccion) {
        alert("Completa todos los campos");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        alert("Correo inválido");
        return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(datos.telefono)) {
        alert("Teléfono inválido");
        return;
    }

    var boton = e.target.querySelector('button[type="submit"]');
    boton.disabled = true;

    var peticion = id
        ? axios.put(url + "/empleados/" + id, datos, config)     // modificar
        : axios.post(url + "/empleados", datos, config);         // agregar

    peticion.then(function () {
        alert(id ? "Empleado actualizado correctamente" : "Empleado registrado correctamente");
        boton.disabled = false;
        cerrarFormulario();
        document.getElementById("input-buscar").value = "";
        loadEmpleado();
    }).catch(function (err) {
        boton.disabled = false;
        manejarError(err, "No se pudo guardar el empleado");
    });
}

//Eliminar empleado

function eliminar(emp) {
    if (!confirm("¿Eliminar a " + emp.nombre + " " + emp.apellidos + "? Esta acción no se puede deshacer.")) {
        return;
    }

    axios.delete(url + "/empleados/" + emp.id_empleado, config).then(function () {
        loadEmpleado();
    }).catch(function (err) {
        manejarError(err, "No se pudo eliminar el empleado");
    });
}