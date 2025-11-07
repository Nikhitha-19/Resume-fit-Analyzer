from flask import Blueprint, jsonify

analyze_bp = Blueprint('analyze', __name__)

@analyze_bp.route('/')
def home():
    return jsonify({"msg": "ATS Resume Analyzer is running!"})
