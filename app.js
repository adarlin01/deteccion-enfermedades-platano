// =================================================
// VARIABLES DE CONTROL GENERAL Y CACHÉ LOCAL
// =================================================
let imagenBase64Cache = ""; 
let indiceHistorialSeleccionado = null; 
let resultadoGuardadoActual = false; 

let resultadoIAActual = {
    enfermedad: "Sin resultado",
    confianza: 0,
    descripcion: "Sin descripción.",
    claseOriginal: ""
};
let codigoRecuperacionActual = "";
let origenCambioClave = 'perfil';

const infoEnfermedades = {
    "Sana": {
        desc: "La hoja se considera sana cuando no presenta manchas, lesiones, zonas secas, necrosis o cambios anormales de color asociados a las enfermedades entrenadas en el modelo.",
        tipos: "No corresponde a una enfermedad. Esta clase representa hojas sin síntomas visibles importantes dentro del conjunto de datos utilizado.",
        sintomas: "Coloración verde uniforme, superficie foliar sin manchas extensas, sin bordes quemados, sin lesiones marrones o amarillentas y sin áreas secas notorias.",
        causas: "Una hoja sana suele estar asociada a buen manejo del cultivo, nutrición adecuada, drenaje correcto, ventilación suficiente y ausencia de infección visible.",
        recom: "Mantener monitoreo periódico del cultivo, controlar la humedad, evitar acumulación de hojas enfermas, realizar fertilización equilibrada y revisar las plantas después de lluvias fuertes.",
        imagenes: [
            "sana1.jpeg",
            "sana2.jpeg",
            "sana3.jpeg"
        ]
    },

    "Sigatoka": {
        desc: "La Sigatoka es una enfermedad foliar importante en el cultivo de banano y plátano. Afecta principalmente las hojas, reduciendo la capacidad de la planta para realizar fotosíntesis. Cuando avanza, puede provocar secamiento de grandes áreas de la hoja y disminuir el desarrollo del racimo.",
        tipos: "Dentro del grupo de Sigatoka existen diferentes variantes o enfermedades relacionadas, como la Sigatoka negra y la Sigatoka amarilla. La Sigatoka negra suele ser más agresiva y produce lesiones oscuras que avanzan con rapidez. La Sigatoka amarilla suele iniciar con manchas o estrías amarillentas que luego pueden oscurecerse.",
        sintomas: "Manchas alargadas, estrías amarillas o marrones, lesiones oscuras, zonas secas, bordes quemados y pérdida progresiva del color verde normal de la hoja. En etapas avanzadas, las manchas pueden unirse y formar áreas grandes de tejido muerto.",
        causas: "Generalmente está asociada a hongos que se desarrollan con alta humedad, lluvias frecuentes, poca ventilación y acumulación de material vegetal infectado.",
        recom: "Realizar deshoje sanitario, eliminar partes muy afectadas, mejorar el drenaje, reducir exceso de humedad, mantener buena ventilación entre plantas y aplicar manejo fitosanitario con orientación de un técnico agrícola.",
        imagenes: [
            "sigatoka1.jpeg",
            "sigatoka2.jpeg",
            "sigatoka3.jpeg"
        ]
    },

    "Cordana": {
        desc: "Cordana es una enfermedad foliar que produce manchas visibles en las hojas del banano o plátano. Puede confundirse con otras enfermedades de manchas foliares, por eso es importante observar la forma, el color y la distribución de las lesiones.",
        tipos: "Se relaciona principalmente con manchas causadas por el hongo Cordana. En algunas plantas puede aparecer junto con otras enfermedades foliares, por eso una hoja puede mostrar síntomas mezclados o parecidos a Sigatoka.",
        sintomas: "Manchas ovaladas o alargadas de color marrón, lesiones con bordes definidos, zonas amarillentas alrededor de la mancha y deterioro progresivo del tejido foliar. En algunos casos las lesiones pueden crecer desde los bordes de la hoja.",
        causas: "Se favorece por humedad alta, presencia de hojas afectadas, falta de limpieza en el cultivo, heridas en la hoja y condiciones ambientales que permiten el desarrollo de hongos.",
        recom: "Retirar hojas o partes muy afectadas, evitar que el material enfermo quede acumulado en el área, mejorar la circulación de aire, controlar la humedad y mantener vigilancia constante en plantas cercanas.",
        imagenes: [
            "cordana1.jpeg",
            "cordana2.jpeg",
            "cordana3.jpeg"
        ]
    },

    "Pestalotiopsis": {
        desc: "Pestalotiopsis es una enfermedad foliar que puede causar manchas necróticas y deterioro del tejido de la hoja. Su presencia puede afectar la apariencia y la capacidad fotosintética de la planta si no se controla a tiempo.",
        tipos: "Puede presentarse como mancha foliar asociada a hongos del género Pestalotiopsis. Sus síntomas pueden parecerse a otras enfermedades de manchas en hojas, por eso el análisis visual y el apoyo del modelo ayudan a orientar el diagnóstico.",
        sintomas: "Manchas marrones o negras, tejido seco o muerto, lesiones irregulares, áreas amarillentas alrededor de la zona afectada y avance gradual del daño en la superficie de la hoja.",
        causas: "Puede desarrollarse con humedad constante, heridas en la hoja, acumulación de residuos vegetales, estrés de la planta y condiciones ambientales favorables para hongos.",
        recom: "Eliminar material vegetal enfermo, evitar daños mecánicos en las hojas, mejorar el manejo de humedad, revisar plantas cercanas y aplicar medidas preventivas recomendadas por personal técnico.",
        imagenes: [
            "pestalotiopsis1.jpeg",
            "pestalotiopsis2.jpeg",
            "pestalotiopsis3.jpeg"
        ]
    }
};

// =========================================================================
// CARGA INICIAL DE DATOS Y PREFERENCIAS
// =========================================================================
window.onload = function() {
    renderizarHistorialInterfaz();

    if (localStorage.getItem('dark_mode') === 'true') {
        const chkDark = document.getElementById('chk-dark-mode');
        if (chkDark) chkDark.checked = true;
        conmutarTemaOscuro(true);
    }

    let font = localStorage.getItem('font_scale') || 'normal';
    const selFont = document.getElementById('sel-font-size');
    if (selFont) selFont.value = font;
    ajustarEscalaTexto(font);

    let av = localStorage.getItem('user_avatar');
    if (av) {
        const avatar = document.getElementById('img-user-avatar');
        if (avatar) avatar.src = av;
    }

    actualizarResumenPerfil();
};

function abrirDetalleHistorialPorTimestamp(timestamp) {
    let db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');

    let indexReal = db.findIndex(item => item.timestamp === timestamp);
    let item = db[indexReal];

    if (!item) {
        console.error("No se encontró el registro con timestamp:", timestamp);
        return;
    }

    indiceHistorialSeleccionado = indexReal;

    document.getElementById('hist-det-title').innerText = item.enfermedad;
    document.getElementById('hist-det-date').innerText = `Capturado el: ${item.fecha}`;
    document.getElementById('hist-det-img').src = item.imagen;
    document.getElementById('hist-det-notes').innerText = item.notas || "Sin notas adicionales.";

    const confianza = document.getElementById('hist-det-confidence');
    if (confianza) {
        confianza.innerText = item.confianza ? `Confianza: ${item.confianza}%` : "Confianza: --";
    }

    const descripcion = document.getElementById('hist-det-description');
    if (descripcion) {
        descripcion.innerHTML = item.descripcion || "No hay descripción guardada.";
    }

    cambiarPantalla('scr-detalle-historial-completo');
}

// NAVEGACIÓN ENTRE PANTALLAS SIMULADAS
function cambiarPantalla(id) {
    const targetScreen = document.getElementById(id);

    if (!targetScreen) {
        console.error("No existe la pantalla con id:", id);
        return;
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');

    const pantallasIniciales = ['scr-bienvenida', 'scr-login', 'scr-registro', 'scr-splash', 'scr-cambiar-clave', 'scr-recuperar-email', 'scr-recuperar-codigo'];
    const navBar = document.getElementById('global-bottom-nav');

    if (navBar) {
        navBar.style.display = pantallasIniciales.includes(id) ? 'none' : 'flex';
    }

    const menuOrden = document.getElementById('box-menu-orden');
    if (menuOrden) menuOrden.style.display = 'none';
}

function gestorNavegacionGlobal(idPantalla, idNavItem) {
    cambiarPantalla(idPantalla);

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active-nav'));

    const navActivo = document.getElementById(idNavItem);
    if (navActivo) {
        navActivo.classList.add('active-nav');
    }

    if (idPantalla === 'scr-historial') {
        renderizarHistorialInterfaz();
    }
    if (idPantalla === 'scr-perfil') {
    actualizarResumenPerfil();
}
}

// LOGICA DE ACCESO Y REGISTRO DE USUARIO
function registrarUsuarioEstructura() {
    let n = document.getElementById('reg-name').value;
    let e = document.getElementById('reg-email').value;
    let p = document.getElementById('reg-pass').value;

    if (n.trim() === "" || e.trim() === "" || p.trim() === "") {
        alert("Por favor completa todos los campos del formulario");
        return;
    }

    if (p.length < 4) {
        alert("La contraseña debe tener al menos 4 caracteres");
        return;
    }

    localStorage.setItem('user_fullname', n);
    localStorage.setItem('user_email', e);
    localStorage.setItem('user_password', p);

    alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');

    document.getElementById('lbl-user-profile-name').innerText = n;

    const lblEmail = document.getElementById('lbl-user-profile-email');
    if (lblEmail) lblEmail.innerText = e;

    cambiarPantalla('scr-login');
}

function abrirCambiarContrasena() {
    origenCambioClave = 'perfil';
    document.getElementById('pass-nueva').value = "";
    document.getElementById('pass-repetir').value = "";
    document.getElementById('pass-error-msg').style.display = "none";
    cambiarPantalla('scr-cambiar-clave');
}

function procesarCambioContrasena() {
    const nueva = document.getElementById('pass-nueva').value;
    const repetir = document.getElementById('pass-repetir').value;
    const errorMsg = document.getElementById('pass-error-msg');

    errorMsg.style.display = "none";

    if (nueva.trim() === "" || repetir.trim() === "") {
        errorMsg.innerText = "Completa ambos campos.";
        errorMsg.style.display = "block";
        return;
    }

    if (nueva.length < 4) {
        errorMsg.innerText = "La contraseña debe tener al menos 4 caracteres.";
        errorMsg.style.display = "block";
        return;
    }

    if (nueva !== repetir) {
        errorMsg.innerText = "Las contraseñas no coinciden.";
        errorMsg.style.display = "block";
        return;
    }

    localStorage.setItem('user_password', nueva);

    document.getElementById('pass-nueva').value = "";
    document.getElementById('pass-repetir').value = "";

    mostrarToast("Tu contraseña ha sido reemplazada con éxito 💚");

        if (origenCambioClave === 'recovery') {
            cambiarPantalla('scr-login');
        } else {
            cambiarPantalla('scr-perfil');
                }
}


function procesarLoginConSplash() {
    const u = document.getElementById('login-user').value.trim().toLowerCase();
    const p = document.getElementById('login-pass').value.trim();

    const nombreGuardado = localStorage.getItem('user_fullname') || "";
    const correoGuardado = localStorage.getItem('user_email') || "";
    const passGuardado = localStorage.getItem('user_password') || "";

    const nombreNormalizado = nombreGuardado.trim().toLowerCase();
    const correoNormalizado = correoGuardado.trim().toLowerCase();

    // Cuenta demo opcional
    const loginDemo = u === "admin" && p === "1234";

    // Login con usuario registrado: acepta correo o nombre
    const loginRegistrado =
        passGuardado &&
        p === passGuardado &&
        (u === correoNormalizado || u === nombreNormalizado);

    if (loginRegistrado || loginDemo) {
        const lblNombre = document.getElementById('lbl-user-profile-name');
        const lblEmail = document.getElementById('lbl-user-profile-email');

        if (loginRegistrado) {
            if (lblNombre) lblNombre.innerText = nombreGuardado || "Usuario";
            if (lblEmail) lblEmail.innerText = correoGuardado || "correo@ejemplo.com";
        }

        if (loginDemo) {
            if (lblNombre) lblNombre.innerText = "Usuario Demo";
            if (lblEmail) lblEmail.innerText = "admin@greenleaf.ai";
        }

        actualizarResumenPerfil();

        cambiarPantalla('scr-splash');

        setTimeout(() => {
            cambiarPantalla('scr-menu-principal');
        }, 2000);

    } else {
        alert("Usuario, correo o contraseña incorrectos.");
    }
}

// PROCESAMIENTO ANALÍTICO DE LA IMAGEN
async function imagenSeleccionada(input) {
    if (!input.files || !input.files[0]) return;

    const archivo = input.files[0];
    const lector = new FileReader();

    lector.onload = async function(e) {
        try {
            imagenBase64Cache = e.target.result;

            resultadoGuardadoActual = false;

            const fondoAnalisis = document.getElementById('analysis-bg-image');
            if (fondoAnalisis) {
                fondoAnalisis.style.backgroundImage = `url(${imagenBase64Cache})`;
            }

            cambiarPantalla('scr-analizando');

            const notas = document.getElementById('txt-analisis-notas');
            if (notas) notas.value = "";

            document.querySelectorAll('.status-item').forEach(item => item.classList.remove('completed'));
            document.querySelectorAll('.check-mark').forEach(mark => mark.innerHTML = "");

            await animarProcesoAnalisis();

           const API_URL = `${window.location.protocol}//${window.location.hostname}:8000/predecir`;

            const respuesta = await fetch(API_URL, {
            method: "POST",
             headers: {
              "Content-Type": "application/json"
                        },
                body: JSON.stringify({
              imagen: imagenBase64Cache
                  })
                });

            const datos = await respuesta.json();

            if (datos.error) {
                throw new Error(datos.error);
            }

            mostrarResultadoIA(datos);
            cambiarPantalla('scr-resultado-final');

        } catch (error) {
            console.error("Error al analizar la imagen:", error);
            alert("No se pudo analizar la imagen. Revisa que el servidor de Python esté encendido.");
            cambiarPantalla('scr-diagnostico');
        }
    };

    lector.readAsDataURL(archivo);
}

function enviarCodigoRecuperacion() {
    const email = document.getElementById('recuperar-email').value.trim();
    const errorMsg = document.getElementById('recuperar-email-error');
    errorMsg.style.display = "none";

    const correoGuardado = (localStorage.getItem('user_email') || "").trim().toLowerCase();

    if (email === "") {
        errorMsg.innerText = "Escribe tu correo.";
        errorMsg.style.display = "block";
        return;
    }

    if (correoGuardado === "" || email.toLowerCase() !== correoGuardado) {
        errorMsg.innerText = "No encontramos una cuenta con ese correo.";
        errorMsg.style.display = "block";
        return;
    }

    codigoRecuperacionActual = String(Math.floor(1000 + Math.random() * 9000));

    // Prototipo sin servidor de correo real: mostramos el código simulando el email
    alert("Hemos enviado un código a tu correo (demo): " + codigoRecuperacionActual);

    document.getElementById('recuperar-codigo-input').value = "";
    document.getElementById('recuperar-codigo-error').style.display = "none";
    cambiarPantalla('scr-recuperar-codigo');
}

function verificarCodigoRecuperacion() {
    const codigoIngresado = document.getElementById('recuperar-codigo-input').value.trim();
    const errorMsg = document.getElementById('recuperar-codigo-error');
    errorMsg.style.display = "none";

    if (codigoIngresado === "") {
        errorMsg.innerText = "Escribe el código.";
        errorMsg.style.display = "block";
        return;
    }

    if (codigoIngresado !== codigoRecuperacionActual) {
        errorMsg.innerText = "Código incorrecto. Intenta de nuevo.";
        errorMsg.style.display = "block";
        return;
    }

    origenCambioClave = 'recovery';
    document.getElementById('pass-nueva').value = "";
    document.getElementById('pass-repetir').value = "";
    document.getElementById('pass-error-msg').style.display = "none";
    cambiarPantalla('scr-cambiar-clave');
}

function volverDesdeCambioClave() {
    if (origenCambioClave === 'recovery') {
        cambiarPantalla('scr-recuperar-codigo');
    } else {
        cambiarPantalla('scr-perfil');
    }
}

// =========================================================================
// CONTROL PERSISTENTE DEL HISTORIAL DE ANALISIS
// =========================================================================
function guardarEnHistorialAutomatico(mostrarAlerta = true) {
    if (resultadoGuardadoActual) {
        return;
    }

    let notes = document.getElementById('txt-analisis-notas').value;
    let db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');

    let nuevoRegistro = {
        enfermedad: resultadoIAActual.enfermedad,
        confianza: resultadoIAActual.confianza,
        descripcion: resultadoIAActual.descripcion,
        claseOriginal: resultadoIAActual.claseOriginal,
        fecha: new Date().toLocaleString(),
        timestamp: Date.now(),
        imagen: imagenBase64Cache || "",
        notas: notes.trim() !== "" ? notes : "Sin notas adicionales."
    };

    db.push(nuevoRegistro);
    localStorage.setItem('greenleaf_history', JSON.stringify(db));

    resultadoGuardadoActual = true;

    if (mostrarAlerta) {
        alert("¡Análisis guardado en tu historial local!");
    }
}

function renderizarHistorialInterfaz(orden = 'desc') {
    const listaWrapper = document.getElementById('wrapper-lista-historial');
    let db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');

    if (!listaWrapper) return;

    if (db.length === 0) {
        listaWrapper.innerHTML = `
            <p style="color:#777; font-size:13px; text-align:center; margin-top:30px;">
                No hay análisis guardados.
            </p>
        `;
        return;
    }

    db.sort((a, b) => orden === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);

    listaWrapper.innerHTML = "";

    db.forEach((item) => {
        let card = document.createElement('div');
        card.className = "history-item-card";

        card.onclick = function() {
            abrirDetalleHistorialPorTimestamp(item.timestamp);
        };

        card.innerHTML = `
            <img class="history-thumb" src="${item.imagen}">
            <div class="history-card-info">
                <span class="history-card-disease">${item.enfermedad}</span>
                <span class="history-card-date">${item.fecha}</span>
                <span class="history-card-notes">${item.notas || "Sin notas adicionales."}</span>
            </div>
            <span>➔</span>
        `;

        listaWrapper.appendChild(card);
    });
}

function conmutarMenuOrdenamiento(e) {
    e.stopPropagation();
    let m = document.getElementById('box-menu-orden');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function ordenarHistorialInterfaz(tipo) {
    renderizarHistorialInterfaz(tipo);
    document.getElementById('box-menu-orden').style.display = 'none';
}

function abrirDetalleHistorialPorTimestamp(timestamp) {
    let db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');

    let indexReal = db.findIndex(item => item.timestamp === timestamp);
    let item = db[indexReal];

    if (!item) return;

    indiceHistorialSeleccionado = indexReal;

    document.getElementById('hist-det-title').innerText = item.enfermedad;
    document.getElementById('hist-det-date').innerText = `Capturado el: ${item.fecha}`;
    document.getElementById('hist-det-img').src = item.imagen;
    document.getElementById('hist-det-notes').innerText = item.notas || "Sin notas adicionales.";

    const confianza = document.getElementById('hist-det-confidence');
    if (confianza) {
        confianza.innerText = item.confianza ? `Confianza: ${item.confianza}%` : "Confianza: --";
    }

    const descripcion = document.getElementById('hist-det-description');
    if (descripcion) {
        descripcion.innerHTML = item.descripcion || "No hay descripción guardada.";
    }

    cambiarPantalla('scr-detalle-historial-completo');
}

function eliminarRegistroActualHistorial() {
    if(indiceHistorialSeleccionado === null) return;
    if(confirm("¿Deseas borrar este registro?")) {
        let db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');
        db.splice(indiceHistorialSeleccionado, 1);
        localStorage.setItem('greenleaf_history', JSON.stringify(db));
        cambiarPantalla('scr-historial');
        renderizarHistorialInterfaz();
    }
}

// =========================================================================
// EDICIÓN DE PERFIL Y AJUSTES DE INTERFAZ PERSONALIZADA
// =========================================================================
function cambiarFotoPerfilLogica(input) {
    if (input.files && input.files[0]) {
        const lector = new FileReader();
        lector.onload = function(e) {
            document.getElementById('img-user-avatar').src = e.target.result;
            localStorage.setItem('user_avatar', e.target.result);
        };
        lector.readAsDataURL(input.files[0]);
    }
}

function conmutarTemaOscuro(activado) {
    const phone = document.getElementById('main-phone-box');
    if(activado) {
        phone.classList.add('dark-theme');
        localStorage.setItem('dark_mode', 'true');
    } else {
        phone.classList.remove('dark-theme');
        localStorage.setItem('dark_mode', 'false');
    }
}

function ajustarEscalaTexto(escala) {
    const phone = document.getElementById('main-phone-box');

    phone.classList.remove('txt-small', 'txt-large');

    if (escala === 'small') {
        phone.classList.add('txt-small');
    }

    if (escala === 'large') {
        phone.classList.add('txt-large');
    }

    localStorage.setItem('font_scale', escala);
}

// =========================================================================
// EXPORTACIÓN A REPORTE CLÍNICO EN PDF (USANDO CDN HTML2PDF)
// =========================================================================
function exportarReportePDF() {
    const elementoReporte = document.getElementById('area-reporte-pdf');
    const opcionesConfig = {
        margin:       15,
        filename:     'Reporte_Clinico_GreenLeafAI.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // Ejecuta la librería conectada por el CDN
    html2pdf().set(opcionesConfig).from(elementoReporte).save();
}

// FUNCIONES SECUNDARIAS DE ENFERMEDADES
function verDetalleEnfermedad(nombre) {
    const datos = infoEnfermedades[nombre];

    if (!datos) {
        console.error("No existe información para:", nombre);
        return;
    }

    document.getElementById('det-titulo').innerText = nombre;
    document.getElementById('det-descripcion').innerText = datos.desc || "Sin descripción disponible.";
    document.getElementById('det-tipos').innerText = datos.tipos || "No hay tipos relacionados registrados.";
    document.getElementById('det-sintomas').innerText = datos.sintomas || "No hay síntomas registrados.";
    document.getElementById('det-causas').innerText = datos.causas || "No hay causas registradas.";
    document.getElementById('det-recomendaciones').innerText = datos.recom || "No hay recomendaciones registradas.";

    const contenedorImagenes = document.getElementById('det-imagenes');
    contenedorImagenes.innerHTML = "";

    if (datos.imagenes && datos.imagenes.length > 0) {
        datos.imagenes.forEach(ruta => {
            const img = document.createElement('img');
            img.src = ruta;
            img.alt = "Imagen de referencia de " + nombre;

            img.onclick = function() {
                abrirModalImagen(ruta);
            };

            img.onerror = function() {
                console.error("No se encontró la imagen:", ruta);
            };

            contenedorImagenes.appendChild(img);
        });
    } else {
        contenedorImagenes.innerHTML = "<p style='font-size:12px; color:#777;'>No hay imágenes registradas.</p>";
    }

    cambiarPantalla('scr-detalle-enfermedad');
}


function abrirModalImagen(ruta) {
    const modal = document.getElementById('modal-imagen-enfermedad');
    const imagen = document.getElementById('modal-img-enfermedad');

    if (!modal || !imagen) {
        console.error("Falta el modal de imagen en el HTML.");
        return;
    }

    imagen.src = ruta;
    modal.style.display = "flex";
}

function cerrarModalImagen() {
    const modal = document.getElementById('modal-imagen-enfermedad');
    const imagen = document.getElementById('modal-img-enfermedad');

    if (!modal || !imagen) return;

    modal.style.display = "none";
    imagen.src = "";
}



function actualizarResumenPerfil() {
    const nombre = localStorage.getItem('user_fullname') || "Hada Montenegro";
    const correo = localStorage.getItem('user_email') || "mont00@icloud.com";
    const db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');

    const lblNombre = document.getElementById('lbl-user-profile-name');
    const lblCorreo = document.getElementById('lbl-user-profile-email');
    const statTotal = document.getElementById('stat-total-analisis');
    const statUltimo = document.getElementById('stat-ultimo-resultado');

    if (lblNombre) lblNombre.innerText = nombre;
    if (lblCorreo) lblCorreo.innerText = correo;
    if (statTotal) statTotal.innerText = db.length;

    if (statUltimo) {
        if (db.length > 0) {
            statUltimo.innerText = db[db.length - 1].enfermedad;
        } else {
            statUltimo.innerText = "N/A";
        }
    }
}

function borrarHistorialLocal() {
    const confirmar = confirm("¿Seguro que deseas borrar todo el historial de análisis?");

    if (!confirmar) return;

    localStorage.removeItem('greenleaf_history');
    renderizarHistorialInterfaz();
    actualizarResumenPerfil();

    alert("Historial eliminado correctamente.");
}

function cerrarSesionUsuario() {
    cambiarPantalla('scr-bienvenida');
}



function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function animarProcesoAnalisis() {
    const tareas = ["task-1", "task-2", "task-3", "task-4"];

    for (let i = 0; i < tareas.length; i++) {
        await esperar(700);

        const el = document.getElementById(tareas[i]);

        if (el) {
            el.classList.add('completed');

            const checkMark = el.querySelector('.check-mark');
            if (checkMark) checkMark.innerHTML = "✓";
        }
    }
}



function mostrarResultadoIA(datos) {
    const nombresBonitos = {
        "healthy": "Hoja sana",
        "sigatoka": "Sigatoka",
        "cordana": "Cordana",
        "pestalotiopsis": "Pestalotiopsis",
        "no_hoja": "Imagen no válida"
    };

    const clavesTips = {
        "healthy": "Sana",
        "sigatoka": "Sigatoka",
        "cordana": "Cordana",
        "pestalotiopsis": "Pestalotiopsis"
    };

    let claseOriginal = datos.clase;
    let enfermedad = nombresBonitos[claseOriginal] || claseOriginal;
    let confianza = datos.confianza || 0;
    let descripcion = datos.descripcion || "No hay descripción disponible.";

    if (claseOriginal === "no_hoja") {
        enfermedad = "Imagen no válida";
        confianza = 0;
        descripcion = "No se encontró una hoja válida en la imagen. Intenta subir una foto clara de una hoja de plátano.";
    } else {
        const claveTip = clavesTips[claseOriginal];
        const info = infoEnfermedades[claveTip];

        if (info) {
            descripcion = `
                <strong>Descripción:</strong> ${info.desc}<br><br>
                <strong>Síntomas visibles:</strong> ${info.sintomas}<br><br>
                <strong>Recomendación:</strong> ${info.recom}
            `;
        }
    }

    resultadoIAActual = {
        enfermedad: enfermedad,
        confianza: confianza,
        descripcion: descripcion,
        claseOriginal: claseOriginal
    };

    const titulo = document.getElementById('res-enfermedad');
    const conf = document.getElementById('res-confianza');
    const desc = document.getElementById('res-descripcion');
    const imgPreview = document.getElementById('res-img-preview');

    if (titulo) titulo.innerText = enfermedad;
    if (conf) conf.innerText = `Nivel de confianza: ${confianza}%`;
    if (desc) desc.innerHTML = descripcion;
    if (imgPreview) imgPreview.src = imagenBase64Cache;
}



function guardarYAnalizarNuevaHoja() {
    guardarEnHistorialAutomatico(false);
    renderizarHistorialInterfaz();
    cambiarPantalla('scr-diagnostico');
}

function guardarResultadoYVolverInicio() {
    guardarEnHistorialAutomatico(false);
    renderizarHistorialInterfaz();
    gestorNavegacionGlobal('scr-menu-principal', 'nav-home');
}


function exportarHistorialPDF() {
    const db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');

    if (db.length === 0) {
        alert("No hay análisis guardados para exportar.");
        return;
    }

    let contenido = document.createElement('div');
    contenido.style.padding = "25px";
    contenido.style.fontFamily = "Arial, sans-serif";
    contenido.style.color = "#222";

    let html = `
        <h1 style="color:#0A5C1D; text-align:center; margin-bottom:5px;">GreenLeaf AI</h1>
        <h2 style="text-align:center; margin-top:0;">Historial de análisis</h2>
        <p style="text-align:center; color:#666; font-size:13px;">
            Reporte generado el ${new Date().toLocaleString()}
        </p>
        <hr style="margin:20px 0;">
    `;

    db
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach((item, index) => {
            html += `
                <div style="margin-bottom:25px; padding:15px; border:1px solid #ddd; border-radius:12px; page-break-inside: avoid;">
                    <h3 style="color:#d9534f; margin-bottom:5px;">
                        ${index + 1}. ${item.enfermedad || "Sin resultado"}
                    </h3>

                    <p style="margin:4px 0;"><strong>Fecha:</strong> ${item.fecha || "Sin fecha"}</p>
                    <p style="margin:4px 0;"><strong>Confianza:</strong> ${item.confianza ? item.confianza + "%" : "--"}</p>

                    ${item.imagen ? `
                        <img src="${item.imagen}" style="width:100%; max-height:220px; object-fit:cover; border-radius:10px; margin:10px 0;">
                    ` : ""}

                    <p style="margin:8px 0;"><strong>Descripción / recomendación:</strong></p>
                    <div style="font-size:13px; line-height:1.5;">
                        ${item.descripcion || "No hay descripción guardada."}
                    </div>

                    <p style="margin-top:10px;"><strong>Notas de campo:</strong></p>
                    <p style="font-size:13px; line-height:1.5;">
                        ${item.notas || "Sin notas adicionales."}
                    </p>
                </div>
            `;
        });

    contenido.innerHTML = html;

    const opciones = {
        margin: 10,
        filename: 'Historial_GreenLeafAI.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(contenido).save();
}


function exportarDetalleHistorialPDF() {
    if (indiceHistorialSeleccionado === null) {
        alert("No hay ningún análisis seleccionado.");
        return;
    }

    const db = JSON.parse(localStorage.getItem('greenleaf_history') || '[]');
    const item = db[indiceHistorialSeleccionado];

    if (!item) {
        alert("No se encontró el análisis seleccionado.");
        return;
    }

    let contenido = document.createElement('div');
    contenido.style.padding = "25px";
    contenido.style.fontFamily = "Arial, sans-serif";
    contenido.style.color = "#222";

    contenido.innerHTML = `
        <h1 style="color:#0A5C1D; text-align:center; margin-bottom:5px;">GreenLeaf AI</h1>
        <h2 style="text-align:center; margin-top:0;">Reporte individual de análisis</h2>
        <p style="text-align:center; color:#666; font-size:13px;">
            Reporte generado el ${new Date().toLocaleString()}
        </p>

        <hr style="margin:20px 0;">

        <h2 style="color:#d9534f;">${item.enfermedad || "Sin resultado"}</h2>

        <p><strong>Fecha del análisis:</strong> ${item.fecha || "Sin fecha"}</p>
        <p><strong>Nivel de confianza:</strong> ${item.confianza ? item.confianza + "%" : "--"}</p>

        ${item.imagen ? `
            <img src="${item.imagen}" style="width:100%; max-height:280px; object-fit:cover; border-radius:12px; margin:15px 0;">
        ` : ""}

        <h3 style="color:#0A5C1D;">Descripción y recomendación</h3>
        <div style="font-size:14px; line-height:1.5;">
            ${item.descripcion || "No hay descripción guardada."}
        </div>

        <h3 style="color:#0A5C1D;">Notas de campo</h3>
        <p style="font-size:14px; line-height:1.5;">
            ${item.notas || "Sin notas adicionales."}
        </p>

        <hr style="margin:20px 0;">

        <p style="font-size:11px; color:#777; text-align:center;">
            Este reporte fue generado por GreenLeaf AI como prototipo académico de detección de enfermedades en hojas de plátano.
        </p>
    `;

    const opciones = {
        margin: 10,
        filename: `Analisis_${item.enfermedad || "GreenLeafAI"}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };



    html2pdf().set(opciones).from(contenido).save();

}



function toggleFaq(btn) {
  const item = btn.parentElement;

  // cerrar otros
  document.querySelectorAll(".faq-item").forEach(el => {
    if (el !== item) el.classList.remove("active");
  });

  // toggle actual
  item.classList.toggle("active");
}


function contactarSoporte() {
  alert("Nuestro equipo revisará su mensaje. Gracias por escribirnos.");
}

function openSupport() {
    document.getElementById("supportModal").style.display = "flex";
}

function closeSupport() {
    document.getElementById("supportModal").style.display = "none";
}

function enviarSoporte() {
    let mensaje = document.getElementById("mensajeSoporte").value;

    if (mensaje.trim() === "") {
        alert("Escribe un mensaje primero");
        return;
    }

    // cerrar modal
    closeSupport();

    // mensaje dentro de la app (mejor que alert)
    mostrarToast("Nuestro equipo revisará tu mensaje. Gracias por escribirnos 💚");

    document.getElementById("mensajeSoporte").value = "";
}

function mostrarToast(texto) {
    let toast = document.getElementById("toast");
    toast.innerText = texto;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}