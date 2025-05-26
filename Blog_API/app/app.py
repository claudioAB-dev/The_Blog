# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# from sqlalchemy.orm import Mapped, mapped_column # No se usan actualmente
import os
# import pymysql # pymysql es usado por SQLAlchemy si está en la URI, no necesita importarse aquí explícitamente
# import json, requests # No se usan actualmente
from .models import db, Autor, Entrada, Comentario
from .routes import main_bp # <--- 1. IMPORTA TU BLUEPRINT
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

app.register_blueprint(main_bp) # <--- 2. REGISTRA EL BLUEPRINT

BASE_URL = 'http://127.0.0.1:5000' # Esta variable no se usa para el enrutamiento aquí

@app.route('/')
def index():
    return "Hola Mundo"

# Si quieres ejecutar la app directamente con 'python app.py'
# if __name__ == '__main__':
#     app.run(debug=True) # debug=True es útil para desarrollo