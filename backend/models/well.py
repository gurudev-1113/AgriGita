from backend.extensions import db
from datetime import datetime

class Well(db.Model):
    __tablename__ = 'wells'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    depth = db.Column(db.Float, default=0.0)
    water_level = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'depth': self.depth,
            'water_level': self.water_level,
            'created_at': self.created_at.isoformat()
        }
