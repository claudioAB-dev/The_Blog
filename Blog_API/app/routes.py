from flask import Blueprint, request, jsonify
from app import db # Importa la instancia de db que se inicializó en app.py
from .models import Autor, Entrada, Comentario # Importa tus modelos

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

# Añade más rutas para PUT (actualizar), DELETE (eliminar), y para tus modelos Entrada y Comentario.