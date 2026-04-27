from backend.extensions import db
from datetime import datetime

class Valve(db.Model):
    __tablename__ = 'valves'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.Boolean, default=False)
    flow_rate = db.Column(db.Float, default=0.0)
    health = db.Column(db.String(20), default='good')  # good, warning, damaged
    last_toggled = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    water_logs = db.relationship('WaterLog', backref='valve', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'flow_rate': self.flow_rate,
            'health': self.health,
            'last_toggled': self.last_toggled.isoformat() if self.last_toggled else None,
            'created_at': self.created_at.isoformat()
        }
