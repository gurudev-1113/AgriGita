from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.valve import Valve
from backend.models.well import Well
from backend.models.pipeline import Pipeline
from backend.models.alert import Alert
from backend.models.water_log import WaterLog
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())

    total_valves = Valve.query.filter_by(user_id=user_id).count()
    active_valves = Valve.query.filter_by(user_id=user_id, status=True).count()
    inactive_valves = total_valves - active_valves
    total_wells = Well.query.filter_by(user_id=user_id).count()
    total_pipelines = Pipeline.query.filter_by(user_id=user_id).count()
    unread_alerts = Alert.query.filter_by(user_id=user_id, is_read=False).count()
    damaged_valves = Valve.query.filter_by(user_id=user_id, health='damaged').count()

    valve_ids = [v.id for v in Valve.query.filter_by(user_id=user_id).all()]
    total_water = 0.0
    if valve_ids:
        result = db.session.query(func.sum(WaterLog.volume)).filter(
            WaterLog.valve_id.in_(valve_ids)
        ).scalar()
        total_water = round(result or 0.0, 2)

    # Water usage for last 7 days
    water_by_day = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        vol = 0.0
        if valve_ids:
            result = db.session.query(func.sum(WaterLog.volume)).filter(
                WaterLog.valve_id.in_(valve_ids),
                WaterLog.timestamp >= day_start,
                WaterLog.timestamp < day_end
            ).scalar()
            vol = round(result or 0.0, 2)
        water_by_day.append({
            'date': day_start.strftime('%b %d'),
            'volume': vol
        })

    recent_alerts = Alert.query.filter_by(user_id=user_id).order_by(
        Alert.created_at.desc()
    ).limit(5).all()

    return jsonify({
        'stats': {
            'total_valves': total_valves,
            'active_valves': active_valves,
            'inactive_valves': inactive_valves,
            'total_wells': total_wells,
            'total_pipelines': total_pipelines,
            'unread_alerts': unread_alerts,
            'damaged_valves': damaged_valves,
            'total_water_used': total_water,
            'water_by_day': water_by_day,
            'recent_alerts': [a.to_dict() for a in recent_alerts]
        }
    }), 200
