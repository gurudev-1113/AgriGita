from backend.extensions import db
from datetime import datetime
import json

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # valve_failure, pipeline_damage, low_water, system
    severity = db.Column(db.String(20), default='info')  # info, warning, critical
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    metadata_json = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'severity': self.severity,
            'message': self.message,
            'is_read': self.is_read,
            'metadata': json.loads(self.metadata_json) if self.metadata_json else {},
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat()
        }
