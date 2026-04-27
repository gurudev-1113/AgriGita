from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.valve import Valve
from backend.models.well import Well
from backend.services.ai_engine import get_valve_suggestions, get_product_recommendations

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_suggestions():
    user_id = int(get_jwt_identity())
    valves = Valve.query.filter_by(user_id=user_id).all()
    wells = Well.query.filter_by(user_id=user_id).all()

    suggestions = get_valve_suggestions(
        [v.to_dict() for v in valves],
        [w.to_dict() for w in wells]
    )
    return jsonify({'suggestions': suggestions}), 200

@ai_bp.route('/product-recommendations', methods=['GET'])
@jwt_required()
def product_recs():
    user_id = int(get_jwt_identity())
    damaged = Valve.query.filter_by(user_id=user_id, health='damaged').all()
    recommendations = get_product_recommendations([v.to_dict() for v in damaged])
    return jsonify({'recommendations': recommendations}), 200
