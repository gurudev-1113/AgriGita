from extensions import db
from datetime import datetime

class WaterLog(db.Model):
    __tablename__ = 'water_logs'

    id = db.Column(db.Integer, primary_key=True)
    valve_id = db.Column(db.Integer, db.ForeignKey('valves.id'), nullable=False)
    flow_rate = db.Column(db.Float, default=0.0)
    duration = db.Column(db.Float, default=0.0)
    volume = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'valve_id': self.valve_id,
            'flow_rate': self.flow_rate,
            'duration': self.duration,
            'volume': self.volume,
            'timestamp': self.timestamp.isoformat() if self.timestamp else datetime.utcnow().isoformat()
        }
