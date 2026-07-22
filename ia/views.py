from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import tensorflow as tf
import numpy as np
import json
from PIL import Image
import io
import base64
import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "modelo", "mejor_modelo.h5")
CLASES_PATH = os.path.join(BASE_DIR, "modelo", "clases.json")

print("Cargando modelo CNN...")
modelo = tf.keras.models.load_model(MODEL_PATH)

with open(CLASES_PATH, "r", encoding="utf-8") as f:
    info = json.load(f)

CLASES = info["clases"]

print("Modelo listo | Clases:", CLASES)


DESCRIPCIONES = {
    "healthy": "La hoja está saludable. No se detectaron signos de enfermedad.",
    "sigatoka": "Sigatoka detectada. Enfermedad fúngica que reduce la capacidad fotosintética y la calidad del fruto.",
    "pestalotiopsis": "Pestalotiopsis detectada. Causa manchas necróticas en las hojas. Se recomienda eliminar el tejido infectado y mejorar la ventilación.",
    "cordana": "Cordana detectada. Enfermedad fúngica que produce manchas en la hoja. Se recomienda retirar hojas afectadas y controlar la humedad."
}


def es_posible_hoja(img):
    img_small = img.resize((224, 224))
    arr = np.array(img_small).astype("float32") / 255.0

    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]

    pixeles_verdes = (g > r * 1.10) & (g > b * 1.10) & (g > 0.20)
    pixeles_amarillos = (r > 0.35) & (g > 0.35) & (b < 0.35)
    pixeles_marrones = (r > 0.20) & (g > 0.12) & (b < 0.18) & (r >= g)

    proporcion_vegetal = np.mean(pixeles_verdes | pixeles_amarillos | pixeles_marrones)

    return proporcion_vegetal >= 0.08


@csrf_exempt
def predecir(request):
    if request.method != "POST":
        return JsonResponse({
            "error": "Método no permitido. Usa POST."
        }, status=405)

    try:
        datos = json.loads(request.body)
        imagen_base64 = datos["imagen"]

        img_data = base64.b64decode(imagen_base64.split(",")[1])
        img = Image.open(io.BytesIO(img_data)).convert("RGB")

        if not es_posible_hoja(img):
            return JsonResponse({
                "clase": "no_hoja",
                "confianza": 0,
                "descripcion": "No se encontró una hoja válida en la imagen. Intenta subir una foto clara de una hoja de plátano.",
                "todas": {}
            })

        img = img.resize((224, 224))
        arr = np.array(img) / 255.0
        arr = np.expand_dims(arr, axis=0)

        predicciones = modelo.predict(arr, verbose=0)[0]

        clase_idx = int(np.argmax(predicciones))
        clase_nombre = CLASES[clase_idx]
        confianza = float(predicciones[clase_idx] * 100)

        todas = {
            c: round(float(p * 100), 1)
            for c, p in zip(CLASES, predicciones)
        }

        if confianza < 70:
            return JsonResponse({
                "clase": "no_hoja",
                "confianza": round(confianza, 1),
                "descripcion": "No se encontró una hoja válida en la imagen. Intenta subir una foto clara de una hoja de plátano.",
                "todas": todas
            })

        return JsonResponse({
            "clase": clase_nombre,
            "confianza": round(confianza, 1),
            "descripcion": DESCRIPCIONES.get(clase_nombre, "No hay descripción disponible."),
            "todas": todas
        })

    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)


def home(request):
    return JsonResponse({
        "mensaje": "Servidor IA GreenLeaf AI activo con Django"
    })