# Proyecto 1 - Ironhack Web Development Bootcamp

## Descripción

Este es el primer proyecto del curso de Desarrollo Web de Ironhack del modulo 2. Es una aplicación web construida con Node.js y Express.
[**Esta app es una pequeña demo de sistema CRUD para mostrar productos, ademas de tener una gestion de usuarios con roles**]

## Tecnologías Utilizadas

*   **Node.js**: Entorno de ejecución para JavaScript del lado del servidor.
*   **Express.js**: Framework para construir aplicaciones web y APIs.
*   **SQLite**: Base de datos NoSQL para almacenar la información.na forma sencilla.
*   **EJS (ejs)**: Motor de plantillas para renderizar las vistas dinámicas.
*   **dotenv**: Para la gestión de variables de entorno.
*   **express-validator**: Middleware para la validación de los datos que llegan al servidor.

## Instalación y Uso

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/emanavas/IronHack_course_2.git
    ```

2.  **Navega al directorio del proyecto:**
    ```bash
    cd Proy1
    ```

3.  **Instala las dependencias:**
    ```bash
    npm install
    ```

4.  **Inicia la aplicación:**
    ```bash
    npm start
    ```
    La aplicación estará disponible en `http://localhost:3000` (o el puerto que hayas configurado en tu fichero `.env`).

## Estructura del Proyecto

```
/
|-- config/           # Ficheros de configuración (sesión, etc.)
|-- models/           # Modelos de la base de datos (Mongoose)
|-- node_modules/     # Dependencias del proyecto
|-- public/           # Ficheros estáticos (CSS, JS, imágenes)
|-- routes/           # Definición de las rutas de la aplicación
|-- views/            # Plantillas de las vistas (HBS, EJS, etc.)
|-- .env              # Variables de entorno (no subir a Git)
|-- .gitignore        # Ficheros ignorados por Git
|-- index.js            # Fichero principal de la aplicación Express
|-- package.json      # Metadatos y dependencias del proyecto
|-- README.md         # Este fichero
```

## Autor

*   **Emanuel Navas** - TuPerfilDeGitHub