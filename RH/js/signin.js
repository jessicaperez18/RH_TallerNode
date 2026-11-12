window.onload = init;

var url = "http://localhost:3000";
var config = {};

function init() {
    var token = localStorage.getItem("token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    config = { headers: { 'Authorization': "Bearer " + token } };

    document.getElementById('btn-cancelar').addEventListener('click', function () {
        window.location.href = "rh.html";
    });

    document.getElementById('form-signin').addEventListener('submit', signin);
}

function signin(e) {
    e.preventDefault();

    var name = document.getElementById('input-name').value.trim();
    var mail = document.getElementById('input-mail').value.trim();
    var pass = document.getElementById('input-password').value;

    if (!name || !mail || !pass) {
        alert("Completa todos los campos");
        return;
    }

    if (pass.length < 8 || pass.length > 72) {
        alert("La contraseña debe tener entre 8 y 72 caracteres");
        return;
    }

    var boton = e.target.querySelector('button[type="submit"]');
    boton.disabled = true;

    axios.post(url + "/usuarios", {
        nombre_usuario: name,
        email_usuario: mail,
        password: pass
    }, config).then(function () {
        alert("Usuario registrado correctamente");
        window.location.href = "rh.html";
    }).catch(function (err) {
        boton.disabled = false;

        if (!err.response) {
            alert("No se pudo conectar con el servidor");
        } else if (err.response.status === 401) {
            localStorage.removeItem("token");
            window.location.replace("login.html");
        } else if (err.response.status === 409) {
            alert("El usuario o correo ya existe");
        } else if (err.response.status === 400) {
            alert(err.response.data.message);
        } else {
            alert("Error del servidor, intenta más tarde");
        }
        console.error(err);
    });
}