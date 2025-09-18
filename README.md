# 🧠 Text Tools API + Frontend

Este proyecto implementa una API básica en **Node.js + Express** para manipular texto y un **frontend sencillo** en HTML/JS para probarla directamente desde el navegador.

Incluye dos endpoints POST:

- `/text/process`: procesa texto con paréntesis anidados y los invierte paso a paso.
- `/text/transform`: transforma texto aplicando capitalización alternada, reemplazo de vocales y detección de palabras únicas.

---

## 📌 Tecnologías usadas

- Node.js
- Express.js
- HTML + JavaScript
- Deploy en Render

---

## 📁 Estructura del proyecto

```
text-tools/
├── index.js            # API + servidor de archivos estáticos
├── package.json
└── public/             # Frontend básico
    ├── index.html
    └── app.js
```

---

## 🧪 Endpoints

### 1. POST `/text/process`

Procesa texto con paréntesis anidados e invierte su contenido paso a paso desde los más internos hacia fuera.

**Entrada:**
```json
{ "text": "(Hola (Mundo))" }
```

**Salida:**
```json
{
  "result": [
    "(Hola (Mundo))",
    "(Hola odnuM)",
    "Mundo aloH"
  ]
}
```

---

### 2. POST `/text/transform`

Aplica transformaciones al texto:

- Alternancia de mayúsculas/minúsculas.
- Reemplazo de vocales.
- Lista de palabras únicas (ignora puntuación y repeticiones).

**Entrada:**
```json
{ "text": "Hello world! This is a test. Hello again." }
```

**Salida:**
```json
{
  "alternating_caps": "HeLlO WoRlD! ThIs Is A TeSt. HeLlO AgAiN.",
  "vowel_replacement": "Hillu wurld! Thes es e tist. Hillu egeon.",
  "unique_words": ["world", "This", "is", "a", "test", "again"]
}
```

---

## 🖥️ Ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/text-tools.git
cd text-tools
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el servidor

```bash
npm start
```

El servidor se levantará en:

```
http://localhost:3000
```

### 4. Probar en navegador

Abre [http://localhost:3000](http://localhost:3000) y usa el formulario visual para interactuar con los endpoints.

---

## 📬 Pruebas con Postman

### 1. Abrir Postman y crear una nueva petición

- Método: `POST`
- URL: `http://localhost:3000/text/process`  
- En **Body → raw → JSON**:

```json
{
  "text": "(Hola (Mundo))"
}
```

Presiona **Send** y verás la respuesta.

---

### 2. Segundo endpoint

- Método: `POST`
- URL: `http://localhost:3000/text/transform`  
- En **Body → raw → JSON**:

```json
{
  "text": "Hello world! This is a test. Hello again."
}
```

Presiona **Send** y verás la respuesta con los tres resultados.

---

## 🚀 Deploy en Render

### 1. Subir a GitHub

Sube este proyecto a tu cuenta de GitHub (nombre sugerido: `text-tools`).

---

### 2. Crear Web Service en Render

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Clic en **New → Web Service**
3. Conecta tu cuenta de GitHub y selecciona el repositorio
4. Configura:

- **Build Command**:  
  ```
  npm install
  ```

- **Start Command**:  
  ```
  npm start
  ```

- **Environment**:  
  Node
- **Plan**: Free

5. Clic en **Create Web Service**

---

### 3. Acceso público

Después del deploy, Render te dará una URL como:

```
https://text-tools-q6p7.onrender.com/
```

### 4. Probar la interfaz

Abre la URL anterior en el navegador para usar el frontend.  
Puedes enviar JSONs desde el navegador o seguir usando Postman hacia la URL pública:


---

## ✅ Estado del proyecto

- [x] API funcional en Express
- [x] Frontend para probar desde navegador
- [x] Pruebas en Postman
- [x] Despliegue en Render

---


