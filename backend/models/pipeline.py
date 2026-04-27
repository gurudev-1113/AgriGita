from backend.extensions import db
from datetime import datetime
import json

class Pipeline(db.Model):
    __tablename__ = 'pipelines'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    well_id = db.Column(db.Integer, db.ForeignKey('wells.id'), nullable=True)
    valve_id = db.Column(db.Integer, db.ForeignKey('valves.id'), nullable=True)
    path_data = db.Column(db.Text, default='[]')
    length = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='active')  # active, damaged, inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    well = db.relationship('Well', backref='pipelines')
    valve = db.relationship('Valve', backref='pipelines')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'well_id': self.well_id,
            'valve_id': self.valve_id,
            'path_data': json.loads(self.path_data) if self.path_data else [],
            'length': self.length,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
