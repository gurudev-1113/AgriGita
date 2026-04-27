from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.well import Well

wells_bp = Blueprint('wells', __name__)

@wells_bp.route('/', methods=['GET'])
@jwt_required()
def get_wells():
    user_id = int(get_jwt_identity())
    wells = Well.query.filter_by(user_id=user_id).all()
    return jsonify({'wells': [w.to_dict() for w in wells]}), 200

@wells_bp.route('/<int:well_id>', methods=['GET'])
@jwt_required()
def get_well(well_id):
    user_id = int(get_jwt_identity())
    well = Well.query.filter_by(id=well_id, user_id=user_id).first()
    if not well:
        return jsonify({'error': 'Well not found'}), 404
    return jsonify({'well': well.to_dict()}), 200

@wells_bp.route('/', methods=['POST'])
@jwt_required()
def create_well():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Well name is required'}), 400

    well = Well(
        user_id=user_id,
        name=data['name'],
        latitude=data.get('latitude', 20.5937),
        longitude=data.get('longitude', 78.9629),
        depth=data.get('depth', 50.0),
        water_level=data.get('water_level', 30.0)
    )
    db.session.add(well)
    db.session.commit()
    return jsonify({'well': well.to_dict()}), 201

@wells_bp.route('/<int:well_id>', methods=['PUT'])
@jwt_required()
def update_well(well_id):
    user_id = int(get_jwt_identity())
    well = Well.query.filter_by(id=well_id, user_id=user_id).first()
    if not well:
        return jsonify({'error': 'Well not found'}), 404

    data = request.get_json()
    if data.get('name'):
        well.name = data['name']
    if 'latitude' in data:
        well.latitude = data['latitude']
    if 'longitude' in data:
        well.longitude = data['longitude']
    if 'depth' in data:
        well.depth = data['depth']
    if 'water_level' in data:
        well.water_level = data['water_level']

    db.session.commit()
    return jsonify({'well': well.to_dict()}), 200

@wells_bp.route('/<int:well_id>', methods=['DELETE'])
@jwt_required()
def delete_well(well_id):
    user_id = int(get_jwt_identity())
    well = Well.query.filter_by(id=well_id, user_id=user_id).first()
    if not well:
        return jsonify({'error': 'Well not found'}), 404

    db.session.delete(well)
    db.session.commit()
    return jsonify({'message': 'Well deleted'}), 200
