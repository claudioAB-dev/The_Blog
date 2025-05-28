# routes.py
from flask import Blueprint, request, jsonify
# from app import db # Línea actual
import re
from sqlalchemy.exc import IntegrityError
from .models import db # <--- CAMBIO SUGERIDO: Importar db directamente desde models.py
from .models import Autor, Entrada, Comentario, Categoria, MensajeContacto# Esto ya es correcto
# ... el resto de tu código de routes.py
# Define un Blueprint para organizar tus rutas
main_bp = Blueprint('main', __name__)

@main_bp.route('/autores', methods=['GET'])
def get_autores():
    """Obtiene todos los autores de la base de datos."""
    try:
        autores = Autor.query.all()
        # Convierte los objetos Autor a un formato JSON serializable (lista de diccionarios)
        autores_list = []
        for autor in autores:
            autores_list.append({
                'id': autor.id,
                'nombre': autor.nombre,
                'email': autor.email
                # Aquí puedes añadir más campos si los tienes
            })
        return jsonify(autores_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/autores/<int:autor_id>', methods=['GET'])
def get_autor_by_id(autor_id):
    """Obtiene un autor específico por su ID."""
    try:
        autor = Autor.query.get(autor_id)
        if not autor:
            return jsonify({'message': 'Autor no encontrado'}), 404

        autor_data = {
            'id': autor.id,
            'nombre': autor.nombre,
            'email': autor.email
        }
        return jsonify(autor_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/autores', methods=['POST'])
def create_autor():
    """Crea un nuevo autor."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Datos JSON requeridos'}), 400

        nombre = data.get('nombre')
        email = data.get('email')

        if not nombre or not email:
            return jsonify({'message': 'Nombre y email son requeridos'}), 400

        # Opcional: Validar si el email ya existe
        existing_autor = Autor.query.filter_by(email=email).first()
        if existing_autor:
            return jsonify({'message': 'El email ya está registrado'}), 409 # Conflict

        new_autor = Autor(nombre=nombre, email=email)
        db.session.add(new_autor)
        db.session.commit()

        return jsonify({
            'message': 'Autor creado exitosamente',
            'id': new_autor.id,
            'nombre': new_autor.nombre,
            'email': new_autor.email
        }), 201 # 201 Created
    except Exception as e:
        db.session.rollback() # En caso de error, deshaz la transacción
        return jsonify({'error': str(e)}), 500

def generar_slug(nombre):
    """Genera un slug simple a partir de un nombre."""
    # Convertir a minúsculas
    slug = nombre.lower()
    # Reemplazar espacios y caracteres no alfanuméricos por guiones
    slug = re.sub(r'\s+', '-', slug) # espacios
    slug = re.sub(r'[^\w\-]+', '', slug) # caracteres no alfanuméricos excepto guiones
    # Evitar múltiples guiones seguidos
    slug = re.sub(r'\-{2,}', '-', slug)
    # Quitar guiones al principio o al final
    slug = slug.strip('-')
    return slug

@main_bp.route('/categorias', methods=['POST'])
def create_categoria():
    """Crea una nueva categoría."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No se proporcionaron datos JSON.'}), 400

    nombre = data.get('nombre')
    slug = data.get('slug')
    descripcion = data.get('descripcion')

    if not nombre:
        return jsonify({'message': 'El campo "nombre" es obligatorio.'}), 400

    if not slug:
        slug = generar_slug(nombre)
        # Opcional: verificar si el slug generado ya existe y añadir un sufijo si es necesario
        # Esto es importante porque el slug debe ser único.
        # Por simplicidad, aquí asumimos que el slug generado es único o la BD lo rechazará.

    nueva_categoria = Categoria(
        nombre=nombre,
        slug=slug,
        descripcion=descripcion
    )

    try:
        db.session.add(nueva_categoria)
        db.session.commit()
        return jsonify(nueva_categoria.serialize()), 201
    except IntegrityError as e:
        db.session.rollback()
        # Detectar si el error es por 'nombre' o 'slug' único
        if 'categorias.nombre' in str(e.orig):
             return jsonify({'message': 'Error: El nombre de la categoría ya existe.'}), 409
        elif 'categorias.slug' in str(e.orig):
             return jsonify({'message': 'Error: El slug de la categoría ya existe o el generado ya existe.'}), 409
        else:
            return jsonify({'message': 'Error de integridad en la base de datos.', 'details': str(e.orig)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/categorias', methods=['GET'])
def get_categorias():
    """Obtiene todas las categorías."""
    try:
        categorias = Categoria.query.all()
        return jsonify([categoria.serialize() for categoria in categorias]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/categorias/<int:categoria_id>', methods=['GET'])
def get_categoria_by_id(categoria_id):
    """Obtiene una categoría específica por su ID."""
    try:
        categoria = Categoria.query.get(categoria_id)
        if not categoria:
            return jsonify({'message': 'Categoría no encontrada.'}), 404
        return jsonify(categoria.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/categorias/<int:categoria_id>', methods=['PUT'])
def update_categoria(categoria_id):
    """Actualiza una categoría existente."""
    try:
        categoria = Categoria.query.get(categoria_id)
        if not categoria:
            return jsonify({'message': 'Categoría no encontrada.'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No se proporcionaron datos JSON.'}), 400

        if 'nombre' in data:
            categoria.nombre = data['nombre']
            # Si se cambia el nombre, podrías querer regenerar el slug si no se proporciona uno nuevo
            if 'slug' not in data or not data['slug']:
                 categoria.slug = generar_slug(data['nombre'])

        if 'slug' in data and data['slug']: # Permitir actualizar slug explícitamente
            categoria.slug = data['slug']

        if 'descripcion' in data:
            categoria.descripcion = data.get('descripcion') # Usar .get() para campos opcionales

        db.session.commit()
        return jsonify(categoria.serialize()), 200
    except IntegrityError as e:
        db.session.rollback()
        if 'categorias.nombre' in str(e.orig):
             return jsonify({'message': 'Error: El nombre de la categoría ya existe.'}), 409
        elif 'categorias.slug' in str(e.orig):
             return jsonify({'message': 'Error: El slug de la categoría ya existe.'}), 409
        else:
            return jsonify({'message': 'Error de integridad en la base de datos.', 'details': str(e.orig)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/categorias/<int:categoria_id>', methods=['DELETE'])
def delete_categoria(categoria_id):
    """Elimina una categoría."""
    try:
        categoria = Categoria.query.get(categoria_id)
        if not categoria:
            return jsonify({'message': 'Categoría no encontrada.'}), 404

        db.session.delete(categoria)
        db.session.commit()
        return jsonify({'message': 'Categoría eliminada exitosamente.'}), 200
    except IntegrityError as e: # Podría ocurrir si hay restricciones FK no manejadas
        db.session.rollback()
        return jsonify({'message': 'Error de integridad: No se pudo eliminar la categoría, verifique las entradas asociadas.', 'details': str(e.orig)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
@main_bp.route('/mensajecontacto', methods=['POST'])
def create_contacto():
    """
    Crea un nuevo contacto.
    Espera un JSON con: nombre, email, telefono (opcional), asunto (opcional), mensaje (opcional).
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Datos JSON requeridos'}), 400

        nombre = data.get('nombre_remitente')
        email = data.get('email_remitente')
        asunto = data.get('asunto')     # Campo opcional
        mensaje = data.get('mensaje')   # Campo opcional

        if not nombre or not email:
            return jsonify({'message': 'Nombre y email son requeridos'}), 400

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                return jsonify({'message': 'Formato de email inválido'}), 400


        new_contacto = MensajeContacto(
            nombre_remitente=nombre,
            email_remitente=email,
            asunto=asunto,
            mensaje=mensaje
        )
        db.session.add(new_contacto)
        db.session.commit()

        return jsonify({
            'message': 'Contacto creado exitosamente',
            'id': new_contacto.id,
            'nombre': new_contacto.nombre_remitente,
            'email': new_contacto.email_remitente,
            'asunto': new_contacto.asunto,
            'mensaje': new_contacto.mensaje
        }), 201 # 201 Created

    except Exception as e:
        db.session.rollback() # En caso de error, deshaz la transacción
        # Para depuración, puedes loggear el error:
        # current_app.logger.error(f"Error al crear contacto: {e}")
        return jsonify({'error': str(e)}), 500
