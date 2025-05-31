# Ejercicio de Creación de API con Flask

Este proyecto es un ejercicio práctico enfocado en el desarrollo de una API RESTful utilizando Flask, un microframework de Python. La API sirve como backend para una aplicación de blog, gestionando autores, categorías, entradas de blog y mensajes de contacto.

## Descripción General

El objetivo principal de este ejercicio es demostrar la creación y estructuración de una API con Flask, incluyendo:

* Definición de modelos de datos con SQLAlchemy.
* Creación de rutas (endpoints) para las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los recursos de la API.
* Configuración de la aplicación Flask, incluyendo la gestión de CORS para permitir solicitudes desde un frontend.
* Manejo de variables de entorno para la configuración de la base de datos.
* Soporte básico para internacionalización en algunos modelos, permitiendo contenido en español, inglés y alemán.

## Funcionalidades de la API

La API expone endpoints para gestionar los siguientes recursos:

* **Autores**: Permite obtener la lista de autores y crear nuevos autores.
* **Categorías**: Soporta la creación, lectura, actualización y eliminación de categorías, con campos para nombres en español, inglés y alemán.
* **Entradas de Blog (Posts)**: Permite obtener una lista de todas las entradas o una entrada específica por su `slug`. Las entradas también pueden tener contenido en múltiples idiomas (español, inglés, alemán).
* **Mensajes de Contacto**: Permite a los usuarios enviar mensajes a través de un formulario, los cuales son almacenados en la base de datos.

## Tecnologías Utilizadas (Backend)

* **Python**: Lenguaje de programación principal.
* **Flask**: Microframework web para la creación de la API.
* **Flask-SQLAlchemy**: Extensión de Flask para interactuar con bases de datos SQL a través del ORM SQLAlchemy.
* **Flask-CORS**: Extensión de Flask para manejar Cross-Origin Resource Sharing (CORS).
* **python-dotenv**: Para cargar variables de entorno desde un archivo `.env`.
* **PyMySQL**: Driver de MySQL (asumido por la importación `import pymysql` en `models.py`, aunque no se usa directamente allí, y presente en `requirements.txt`).

## Estructura del Proyecto API

El backend de la API se encuentra dentro de la carpeta `Blog_API/` y sigue una estructura modular:

* `app/app.py`: Archivo principal que crea y configura la aplicación Flask.
* `app/models.py`: Define los modelos de la base de datos (Autor, Categoria, Entrada, Comentario, MensajeContacto, etc.).
* `app/routes.py`: Contiene las definiciones de las rutas de la API utilizando Blueprints de Flask.
* `run.py`: Script para ejecutar la aplicación Flask en un servidor de desarrollo.
* `requirements.txt`: Lista las dependencias de Python necesarias para el backend.

Este ejercicio sirve como una base para entender los principios de desarrollo de APIs con Flask y puede ser extendido con más funcionalidades como autenticación, paginación, pruebas unitarias, y despliegue en un entorno de producción.
