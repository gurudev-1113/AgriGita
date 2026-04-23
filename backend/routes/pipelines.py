from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.pipeline import Pipeline
import json

pipelines_bp = Blueprint('pipelines', __name__)

@pipelines_bp.route('/', methods=['GET'])
@jwt_required()
def get_pipelines():
    user_id = int(get_jwt_identity())
    pipelines = Pipeline.query.filter_by(user_id=user_id).all()
    return jsonify({'pipelines': [p.to_dict() for p in pipelines]}), 200

@pipelines_bp.route('/<int:pipeline_id>', methods=['GET'])
@jwt_required()
def get_pipeline(pipeline_id):
    user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=pipeline_id, user_id=user_id).first()
    if not pipeline:
        return jsonify({'error': 'Pipeline not found'}), 404
    return jsonify({'pipeline': pipeline.to_dict()}), 200

@pipelines_bp.route('/', methods=['POST'])
@jwt_required()
def create_pipeline():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Pipeline name is required'}), 400

    pipeline = Pipeline(
        user_id=user_id,
        name=data['name'],
        well_id=data.get('well_id'),
        valve_id=data.get('valve_id'),
        path_data=json.dumps(data.get('path_data', [])),
        length=data.get('length', 0.0),
        status=data.get('status', 'active')
    )
    db.session.add(pipeline)
    db.session.commit()
    return jsonify({'pipeline': pipeline.to_dict()}), 201

@pipelines_bp.route('/<int:pipeline_id>', methods=['PUT'])
@jwt_required()
def update_pipeline(pipeline_id):
    user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=pipeline_id, user_id=user_id).first()
    if not pipeline:
        return jsonify({'error': 'Pipeline not found'}), 404

    data = request.get_json()
    if data.get('name'):
        pipeline.name = data['name']
    if 'well_id' in data:
        pipeline.well_id = data['well_id']
    if 'valve_id' in data:
        pipeline.valve_id = data['valve_id']
    if 'path_data' in data:
        pipeline.path_data = json.dumps(data['path_data'])
    if 'length' in data:
        pipeline.length = data['length']
    if 'status' in data:
        pipeline.status = data['status']

    db.session.commit()
    return jsonify({'pipeline': pipeline.to_dict()}), 200

@pipelines_bp.route('/<int:pipeline_id>', methods=['DELETE'])
@jwt_required()
def delete_pipeline(pipeline_id):
    user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=pipeline_id, user_id=user_id).first()
    if not pipeline:
        return jsonify({'error': 'Pipeline not found'}), 404

    db.session.delete(pipeline)
    db.session.commit()
    return jsonify({'message': 'Pipeline deleted'}), 200
