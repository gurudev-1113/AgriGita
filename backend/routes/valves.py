from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db, socketio
from models.valve import Valve
from models.water_log import WaterLog
from models.alert import Alert
from datetime import datetime
import random

valves_bp = Blueprint('valves', __name__)

@valves_bp.route('/', methods=['GET'])
@jwt_required()
def get_valves():
    user_id = int(get_jwt_identity())
    valves = Valve.query.filter_by(user_id=user_id).all()
    return jsonify({'valves': [v.to_dict() for v in valves]}), 200

@valves_bp.route('/<int:valve_id>', methods=['GET'])
@jwt_required()
def get_valve(valve_id):
    user_id = int(get_jwt_identity())
    valve = Valve.query.filter_by(id=valve_id, user_id=user_id).first()
    if not valve:
        return jsonify({'error': 'Valve not found'}), 404
    return jsonify({'valve': valve.to_dict()}), 200

@valves_bp.route('/', methods=['POST'])
@jwt_required()
def create_valve():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Valve name is required'}), 400

    valve = Valve(
        user_id=user_id,
        name=data['name'],
        latitude=data.get('latitude', 20.5937),
        longitude=data.get('longitude', 78.9629),
        status=data.get('status', False),
        flow_rate=data.get('flow_rate', 0.0),
        health=data.get('health', 'good')
    )
    db.session.add(valve)
    db.session.commit()
    socketio.emit('valve_update', {'valve': valve.to_dict(), 'action': 'created'}, room=f'user_{user_id}')
    return jsonify({'valve': valve.to_dict()}), 201

@valves_bp.route('/<int:valve_id>', methods=['PUT'])
@jwt_required()
def update_valve(valve_id):
    user_id = int(get_jwt_identity())
    valve = Valve.query.filter_by(id=valve_id, user_id=user_id).first()
    if not valve:
        return jsonify({'error': 'Valve not found'}), 404

    data = request.get_json()
    if data.get('name'):
        valve.name = data['name']
    if 'latitude' in data:
        valve.latitude = data['latitude']
    if 'longitude' in data:
        valve.longitude = data['longitude']
    if 'health' in data:
        valve.health = data['health']
    if 'flow_rate' in data:
        valve.flow_rate = data['flow_rate']

    db.session.commit()
    socketio.emit('valve_update', {'valve': valve.to_dict(), 'action': 'updated'}, room=f'user_{user_id}')
    return jsonify({'valve': valve.to_dict()}), 200

@valves_bp.route('/<int:valve_id>', methods=['DELETE'])
@jwt_required()
def delete_valve(valve_id):
    user_id = int(get_jwt_identity())
    valve = Valve.query.filter_by(id=valve_id, user_id=user_id).first()
    if not valve:
        return jsonify({'error': 'Valve not found'}), 404

    db.session.delete(valve)
    db.session.commit()
    socketio.emit('valve_update', {'valve_id': valve_id, 'action': 'deleted'}, room=f'user_{user_id}')
    return jsonify({'message': 'Valve deleted'}), 200

@valves_bp.route('/<int:valve_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_valve(valve_id):
    user_id = int(get_jwt_identity())
    valve = Valve.query.filter_by(id=valve_id, user_id=user_id).first()
    if not valve:
        return jsonify({'error': 'Valve not found'}), 404

    valve.status = not valve.status
    valve.last_toggled = datetime.utcnow()

    if valve.status:
        valve.flow_rate = round(random.uniform(5.0, 25.0), 2)
    else:
        if valve.flow_rate > 0:
            log = WaterLog(
                valve_id=valve.id,
                flow_rate=valve.flow_rate,
                duration=round(random.uniform(10, 120), 1),
                volume=round(valve.flow_rate * random.uniform(0.5, 2.0), 2)
            )
            db.session.add(log)
        valve.flow_rate = 0.0

    db.session.commit()

    status_text = 'Valve Opened' if valve.status else 'Valve Closed'
    socketio.emit('valve_toggle', {
        'valve': valve.to_dict(),
        'status_text': status_text
    }, room=f'user_{user_id}')

    return jsonify({
        'valve': valve.to_dict(),
        'status_text': status_text
    }), 200

@valves_bp.route('/<int:valve_id>/logs', methods=['GET'])
@jwt_required()
def get_valve_logs(valve_id):
    user_id = int(get_jwt_identity())
    valve = Valve.query.filter_by(id=valve_id, user_id=user_id).first()
    if not valve:
        return jsonify({'error': 'Valve not found'}), 404

    logs = WaterLog.query.filter_by(valve_id=valve_id).order_by(WaterLog.timestamp.desc()).limit(50).all()
    return jsonify({'logs': [l.to_dict() for l in logs]}), 200
