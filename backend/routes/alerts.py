from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.alert import Alert

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['GET'])
@jwt_required()
def get_alerts():
    user_id = int(get_jwt_identity())
    alerts = Alert.query.filter_by(user_id=user_id).order_by(Alert.created_at.desc()).limit(100).all()
    return jsonify({'alerts': [a.to_dict() for a in alerts]}), 200

@alerts_bp.route('/unread', methods=['GET'])
@jwt_required()
def get_unread_count():
    user_id = int(get_jwt_identity())
    count = Alert.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({'unread_count': count}), 200

@alerts_bp.route('/<int:alert_id>/read', methods=['POST'])
@jwt_required()
def mark_read(alert_id):
    user_id = int(get_jwt_identity())
    alert = Alert.query.filter_by(id=alert_id, user_id=user_id).first()
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    alert.is_read = True
    db.session.commit()
    return jsonify({'alert': alert.to_dict()}), 200

@alerts_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Alert.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All alerts marked as read'}), 200

@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
@jwt_required()
def delete_alert(alert_id):
    user_id = int(get_jwt_identity())
    alert = Alert.query.filter_by(id=alert_id, user_id=user_id).first()
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    db.session.delete(alert)
    db.session.commit()
    return jsonify({'message': 'Alert deleted'}), 200
