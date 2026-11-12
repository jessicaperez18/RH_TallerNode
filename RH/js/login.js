window.onload = init;

var url = "http://localhost:3000";

function init() {
    if (localStorage.getItem("token")) {
        window.location.replace("rh.html");
        return;
    }

    document.getElementById('form-login').addEventListener('submit', login);
}

function login(e) {
    e.preventDefault();

    var mail = document.getElementById('input-mail').value.trim();
    var pass = document.getElementById('input-password').value;

    if (!mail || !pass) {
        alert("Ingresa tu correo y contraseña");
        return;
    }

    var boton = e.target.querySelector('button[type="submit"]');
    boton.disabled = true;

    axios.post(url + "/usuarios/login", {
        email_usuario: mail,
        password: pass
    }).then(function (res) {
        localStorage.setItem("token", res.data.token);
        window.location.replace("rh.html");
    }).catch(function (err) {
        boton.disabled = false;

        if (!err.response) {
            alert("No se pudo conectar con el servidor");
        } else if (err.response.status === 401) {
            alert("Usuario y/o contraseña incorrectos");
        } else if (err.response.status === 403) {
            alert("Tu usuario está inactivo");
        } else if (err.response.status === 400) {
            alert("Completa todos los campos");
        } else {
            alert("Error del servidor, intenta más tarde");
        }
        console.error(err);
    });
}