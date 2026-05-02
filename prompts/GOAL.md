# PROYECTO: BotiNoLimpia (botinolimpia.joagonzalez.dev)

## 1. Contexto del Problema
* **Ubicación:** Palermo, CABA.
* **Conflicto:** Presencia de 3 contenedores de basura frente a domicilio residencial. 
* **Impacto:** Ruidos molestos de 95 dBA durante la madrugada (camión compactador), insalubridad, olores y desborde constante.
* **Estado de Reclamos:** Más de 30 días de reclamos diarios vía Boti/SUACI con fotos. Resultados: Tickets cerrados sin solución o ignorados.
* **Objetivo:** Crear una bitácora pública (Site) que documente la desidia del sistema de higiene de CABA para escalarlo a la Defensoría del Pueblo y Fiscalía.

## 2. Definición Técnica
* **Stack:** GitHub Pages (Sitio estático).
* **Dominio:** botinolimpia.joagonzalez.dev (Subdominio de joagonzalez.dev).
* **Identidad Visual:** Parodia del branding oficial de CABA (Amarillo #FFD400, Negro #222222).
* **Logo:** Boti (chatbot) "sucio" y "glitcheado".
* **Estructura del Sitio:** 
    - Home: Manifiesto (Opción B: Impacto Legal/Ciudadano).
    - Bitácora: Tabla dinámica alimentada por un `logs.json`.
    - Galería: Evidencia en video (YouTube) y fotos.

## 3. Estrategia de Automatización (Pipeline)

### A. Almacenamiento y Gestión de Medios
- **Imágenes:** Guardar en el repo bajo `/assets/img/logs/` (optimizadas/comprimidas).
- **Videos:** NO guardar en el repo (por peso). Usar una carpeta local `/pending_videos` que esté en `.gitignore`.

### B. El Pipeline de Carga (Script en Go o Python)
Se requiere un script que realice las siguientes tareas:
1. Detectar archivos nuevos en `/pending_videos`.
2. **YouTube API:** Subir el video como "Unlisted" (no listado) con un título tipo "Evidencia  - [Fecha]".
3. Obtener el `VIDEO_ID`.
4. **Update Data:** Insertar una nueva entrada en el archivo `data/logs.json` con:
    - ID del video.
    - Timestamp.
    - Nivel de dBA (input manual o extraído de metadatos).
    - Número de Ticket de Boti.
5. Mover el video procesado a una carpeta `/archive`.

### C. Despliegue (GitHub Actions)
- Al hacer `git push` del archivo `logs.json` actualizado:
- Un Workflow de GitHub Actions dispara el build del sitio estático.
- El sitio renderiza la nueva entrada de la bitácora automáticamente usando el ID de YouTube.

## 4. Branding & Prompt de Arte (Antigravity/ImageGen)
"A high-quality, professional vector logo design in the exact style of Buenos Aires City branding. The central element is a parody of the 'Boti' chatbot (a friendly, simple robot head icon), but it looks neglected, dirty, and covered in grime and garbage stains. The robot's eyes are glitching, displaying a subtle '404' or 'Error'. Beside it, the iconic 'BA' typography is dripping with black liquid. The color palette is strictly 'CABA Yellow' (#FFD400), charcoal black, and white. Cinematic lighting, clean but gritty aesthetic, minimalist flat design with a satirical, dystopian tone. 4k resolution, pure white background."

## 5. Manifiesto del Sitio (Cuerpo Principal)
"La Bitácora de la Desidia: Cuando el bot no limpia.
Vivir frente a tres contenedores mal gestionados en la Ciudad de Buenos Aires significa perder el derecho al descanso y a un ambiente salubre. Ante la falta de respuesta institucional, este espacio nace como un expediente público. 

Durante más de un mes, se han ingresado reclamos diarios, documentados con material audiovisual, a través de los canales oficiales del Gobierno de la Ciudad (Boti / SUACI). El resultado es siempre el mismo: respuestas automatizadas y tickets que se cierran desde un escritorio, mientras en la calle el camión compactador sigue marcando 95 dBA a la madrugada. 

Este sitio compila la evidencia probatoria de la contravención (ruidos molestos e insalubridad) y la omisión del Estado. Todo el material aquí expuesto se encuentra a disposición de la Defensoría del Pueblo, el Ente Regulador y el Ministerio Público Fiscal de CABA."