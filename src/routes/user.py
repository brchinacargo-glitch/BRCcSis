from flask import Blueprint, request, jsonify
from flask_cors import CORS

user_bp = Blueprint('user', __name__)
CORS(user_bp)

@user_bp.route('/users', methods=['GET'])
def get_users():
    """Endpoint placeholder para usuários"""
    return jsonify({'message': 'Endpoint de usuários não implementado ainda'})

