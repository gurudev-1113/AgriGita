from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), default='')
    phone = db.Column(db.String(20), default='')
    language = db.Column(db.String(10), default='en')
    profile_image = db.Column(db.Text, nullable=True)
    land_details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    valves = db.relationship('Valve', backref='owner', lazy=True)
    wells = db.relationship('Well', backref='owner', lazy=True)
    pipelines = db.relationship('Pipeline', backref='owner', lazy=True)
    alerts = db.relationship('Alert', backref='owner', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'language': self.language,
            'profile_image': self.profile_image,
            'land_details': self.land_details,
            'created_at': self.created_at.isoformat()
        }
