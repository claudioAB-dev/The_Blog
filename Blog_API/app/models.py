from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pymysql
db = SQLAlchemy()

class Autor(db.Model):
    __tablename__ = 'autor'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    biografia = db.Column(db.Text)

    entradas = db.relationship('Entrada', backref='autor', lazy=True)

    def __repr__(self):
        return f"<Autor {self.nombre}>"

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    descripcion = db.Column(db.Text)

    entradas = db.relationship('Entrada', backref='categoria', lazy=True)

    def __repr__(self):
        return f"<Categoria {self.nombre}>"

class Comentario(db.Model):
    __tablename__ = 'comentarios'
    id = db.Column(db.Integer, primary_key=True)
    entrada_id = db.Column(db.Integer, db.ForeignKey('entradas.id'), nullable=False)
    nombre_autor = db.Column(db.String(100), nullable=False)
    email_autor = db.Column(db.String(100), nullable=False)
    sitio_web_autor = db.Column(db.String(255))
    contenido = db.Column(db.Text, nullable=False)
    estado = db.Column(db.Enum('PENDIENTE', 'APROBADO', 'SPAM'), default='PENDIENTE', nullable=False)
    comentario_padre_id = db.Column(db.Integer, db.ForeignKey('comentarios.id'))
    fecha_creacion = db.Column(db.TIMESTAMP, default=datetime.utcnow, nullable=False)

    comentarios_hijos = db.relationship('Comentario', remote_side=[id], backref='comentario_padre', lazy=True)

    def __repr__(self):
        return f"<Comentario {self.id}>"

class Entrada(db.Model):
    __tablename__ = 'entradas'
    id = db.Column(db.Integer, primary_key=True)
    autor_id = db.Column(db.Integer, db.ForeignKey('autor.id'), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)
    titulo = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    resumen = db.Column(db.Text, nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    imagen_destacada = db.Column(db.String(255))
    estado = db.Column(db.Enum('BORRADOR', 'PUBLICADO'), default='BORRADOR', nullable=False)
    fecha_publicacion = db.Column(db.TIMESTAMP)
    fecha_creacion = db.Column(db.TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    comentarios = db.relationship('Comentario', backref='entrada', lazy=True)
    etiquetas = db.relationship('Etiqueta', secondary='entradas_etiquetas', backref=db.backref('entradas', lazy=True))


    def __repr__(self):
        return f"<Entrada {self.titulo}>"

class EntradaEtiqueta(db.Model):
    __tablename__ = 'entradas_etiquetas'
    entrada_id = db.Column(db.Integer, db.ForeignKey('entradas.id'), primary_key=True)
    etiqueta_id = db.Column(db.Integer, db.ForeignKey('etiquetas.id'), primary_key=True)

    def __repr__(self):
        return f"<EntradaEtiqueta Entrada_id: {self.entrada_id}, Etiqueta_id: {self.etiqueta_id}>"

class Etiqueta(db.Model):
    __tablename__ = 'etiquetas'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    slug = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f"<Etiqueta {self.nombre}>"

class MensajeContacto(db.Model):
    __tablename__ = 'mensajes_contacto'
    id = db.Column(db.Integer, primary_key=True)
    nombre_remitente = db.Column(db.String(100), nullable=False)
    email_remitente = db.Column(db.String(100), nullable=False)
    asunto = db.Column(db.String(255))
    mensaje = db.Column(db.Text, nullable=False)
    fecha_envio = db.Column(db.TIMESTAMP, default=datetime.utcnow, nullable=False)
    leido = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f"<MensajeContacto {self.asunto}>"