from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column
import os, pymysql, json,requests
from .models import db, Autor, Entrada, Comentario
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

BASE_URL = 'http://127.0.0.1:5000'

@app.route('/')
def index():
    return "Hola Mundo"

@app.route('/autors')
def get_autors():
    # Aquí deberías obtener los autores de la base de datos
    autors = Autor.query.all()
    return jsonify([autor.serialize() for autor in autors])

@app.route('/entradas')
def get_entradas():
    # Aquí deberías obtener los autores de la base de datos
    entradas = Entrada.query.all()
    return jsonify([entrada.serialize() for entrada in entradas])