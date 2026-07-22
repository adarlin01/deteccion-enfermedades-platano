#  GreenLeaf AI

**Detector de enfermedades en hojas de plátano con inteligencia artificial.**

GreenLeaf AI es un prototipo de aplicación móvil que permite a agricultores y técnicos agrícolas tomar o subir una foto de una hoja de plátano y recibir un diagnóstico automático mediante un modelo de red neuronal convolucional (CNN), identificando si la hoja está sana o presenta alguna de las siguientes enfermedades:

-  Hoja Sana
-  Sigatoka
-  Cordana
-  Pestalotiopsis

---

## ¿Qué incluye este proyecto?

Este repositorio contiene las dos partes de la aplicación:

- **Frontend** (`index.html`, `styles.css`, `app.js`): interfaz simulada de una app móvil, con pantallas de bienvenida, inicio de sesión, registro, diagnóstico, historial de análisis, perfil de usuario y preguntas frecuentes.
- **Backend** (`greenleaf_backend/`, `ia/`, `modelo/`): servidor en Django que recibe la imagen enviada desde el frontend, la procesa y la clasifica usando un modelo de IA entrenado (`mejor_modelo.h5`).

---

## ¿Cómo funciona?

1. El usuario toma o selecciona una foto de una hoja de plátano desde la app.
2. La imagen se envía en formato base64 al backend, al endpoint `/predecir`.
3. El backend valida que la imagen realmente parezca una hoja (mediante un análisis de color) y luego la pasa por el modelo CNN entrenado.
4. El modelo devuelve la clase detectada, el nivel de confianza y una descripción con recomendaciones agronómicas.
5. El resultado se muestra en la app y se guarda automáticamente en el historial local del dispositivo.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Django (Python) |
| IA / Modelo | TensorFlow / Keras (CNN) |
| Exportación de reportes | html2pdf.js |
| Comunicación Frontend-Backend | Fetch API + django-cors-headers |

---

## Cómo ejecutar el proyecto localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/adarlin01/deteccion-enfermedades-platano.git
cd deteccion-enfermedades-platano
```

### 2. Configurar el backend (Django)

Se recomienda crear un entorno virtual antes de instalar las dependencias:

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

Instalar las dependencias necesarias:

```bash
pip install django django-cors-headers tensorflow pillow numpy
```

> Si más adelante generas un archivo `requirements.txt`, este paso se simplifica a `pip install -r requirements.txt`.

Ejecutar el servidor:

```bash
python manage.py runserver
```

El servidor quedará disponible en `http://127.0.0.1:8000/`.

### 3. Ejecutar el frontend

Simplemente abre el archivo `index.html` en tu navegador (o usa una extensión tipo "Live Server" en VS Code).

> Asegúrate de que el backend esté corriendo en el puerto `8000` antes de subir una imagen desde la app, ya que el frontend hace peticiones a `http://localhost:8000/predecir`.

---

##  Estructura del proyecto

```
deteccion-enfermedades-platano/
├── greenleaf_backend/       # Configuración principal del proyecto Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── ia/                      # App de Django con la lógica de predicción
│   ├── views.py
│   └── urls.py
├── modelo/                  # Modelo de IA entrenado
│   ├── mejor_modelo.h5
│   └── clases.json
├── index.html               # Interfaz de la app (frontend)
├── styles.css
├── app.js
├── manage.py
└── .gitignore
```

---

##  Notas y limitaciones

- Este es un **prototipo académico** y no está optimizado para producción.
- El historial de análisis se guarda de forma local en el navegador (`localStorage`), por lo que no se comparte entre dispositivos.
- El `SECRET_KEY` de Django incluido en `settings.py` es solo para desarrollo local; **no debe usarse en un entorno de producción**. Se recomienda moverlo a una variable de entorno.
- `CORS_ALLOW_ALL_ORIGINS = True` está habilitado para facilitar las pruebas; en un entorno real se recomienda restringirlo a dominios específicos.

---

##  Autora

**Adarlin Montenegro** — [@adarlin01](https://github.com/adarlin01)