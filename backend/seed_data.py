import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from backend.extensions import db, bcrypt
from backend.models.user import User
from backend.models.valve import Valve
from backend.models.well import Well
from backend.models.pipeline import Pipeline
from backend.models.alert import Alert
from backend.models.water_log import WaterLog
from datetime import datetime, timedelta
import random
import json

def seed():
    with app.app_context():
        print('Clearing existing data...')
        WaterLog.query.delete()
        Alert.query.delete()
        Pipeline.query.delete()
        Valve.query.delete()
        Well.query.delete()
        User.query.delete()
        db.session.commit()

        print('Creating demo user...')
        pw_hash = bcrypt.generate_password_hash('farmer123').decode('utf-8')
        user = User(
            username='farmer',
            email='farmer@example.com',
            password_hash=pw_hash,
            full_name='Ravi Kumar',
            phone='+91-9876543210',
            language='en'
        )
        db.session.add(user)
        db.session.commit()

        print('Creating wells...')
        wells_data = [
            {'name': 'Main Well', 'lat': 20.5940, 'lon': 78.9625, 'depth': 60, 'water_level': 35},
            {'name': 'North Well', 'lat': 20.5970, 'lon': 78.9640, 'depth': 45, 'water_level': 28},
            {'name': 'South Well', 'lat': 20.5910, 'lon': 78.9610, 'depth': 55, 'water_level': 40},
        ]
        wells = []
        for wd in wells_data:
            well = Well(
                user_id=user.id, name=wd['name'],
                latitude=wd['lat'], longitude=wd['lon'],
                depth=wd['depth'], water_level=wd['water_level']
            )
            db.session.add(well)
            wells.append(well)
        db.session.commit()

        print('Creating valves...')
        valves_data = [
            {'name': 'Field A - Gate Valve', 'lat': 20.5945, 'lon': 78.9635, 'status': True, 'health': 'good'},
            {'name': 'Field B - Drip Valve', 'lat': 20.5955, 'lon': 78.9620, 'status': False, 'health': 'good'},
            {'name': 'Field C - Sprinkler', 'lat': 20.5935, 'lon': 78.9645, 'status': True, 'health': 'good'},
            {'name': 'Field D - Main Line', 'lat': 20.5960, 'lon': 78.9650, 'status': False, 'health': 'warning'},
            {'name': 'Field E - Overflow', 'lat': 20.5920, 'lon': 78.9618, 'status': False, 'health': 'damaged'},
            {'name': 'Field F - Backup', 'lat': 20.5950, 'lon': 78.9615, 'status': True, 'health': 'good'},
        ]
        valves = []
        for vd in valves_data:
            valve = Valve(
                user_id=user.id, name=vd['name'],
                latitude=vd['lat'], longitude=vd['lon'],
                status=vd['status'], health=vd['health'],
                flow_rate=round(random.uniform(8, 20), 2) if vd['status'] else 0.0
            )
            db.session.add(valve)
            valves.append(valve)
        db.session.commit()

        print('Creating pipelines...')
        pipelines_data = [
            {
                'name': 'Main Pipeline A',
                'well_idx': 0, 'valve_idx': 0,
                'path': [[20.5940, 78.9625], [20.5942, 78.9630], [20.5945, 78.9635]],
                'status': 'active'
            },
            {
                'name': 'North Pipeline B',
                'well_idx': 1, 'valve_idx': 3,
                'path': [[20.5970, 78.9640], [20.5965, 78.9645], [20.5960, 78.9650]],
                'status': 'active'
            },
            {
                'name': 'South Pipeline C',
                'well_idx': 2, 'valve_idx': 4,
                'path': [[20.5910, 78.9610], [20.5915, 78.9614], [20.5920, 78.9618]],
                'status': 'damaged'
            },
        ]
        for pd in pipelines_data:
            dist = sum(
                ((pd['path'][i][0] - pd['path'][i+1][0])**2 + (pd['path'][i][1] - pd['path'][i+1][1])**2)**0.5 * 111000
                for i in range(len(pd['path']) - 1)
            )
            pipeline = Pipeline(
                user_id=user.id, name=pd['name'],
                well_id=wells[pd['well_idx']].id,
                valve_id=valves[pd['valve_idx']].id,
                path_data=json.dumps(pd['path']),
                length=round(dist, 1),
                status=pd['status']
            )
            db.session.add(pipeline)
        db.session.commit()

        print('Creating water logs...')
        for valve in valves:
            for day in range(7):
                for _ in range(random.randint(2, 8)):
                    log = WaterLog(
                        valve_id=valve.id,
                        flow_rate=round(random.uniform(5, 25), 2),
                        duration=round(random.uniform(10, 120), 1),
                        volume=round(random.uniform(10, 300), 2),
                        timestamp=datetime.utcnow() - timedelta(days=day, hours=random.randint(0, 23))
                    )
                    db.session.add(log)
        db.session.commit()

        print('Creating alerts...')
        alerts_data = [
            {'type': 'valve_failure', 'severity': 'critical', 'message': '⚠️ Valve "Field E - Overflow" has been damaged and shut down automatically.'},
            {'type': 'pipeline_damage', 'severity': 'warning', 'message': '🔴 South Pipeline C shows signs of damage. Inspect immediately.'},
            {'type': 'low_pressure', 'severity': 'warning', 'message': '📉 Low water pressure detected at "Field D - Main Line".'},
            {'type': 'system', 'severity': 'info', 'message': '✅ System maintenance completed. All sensors recalibrated.'},
            {'type': 'system', 'severity': 'info', 'message': '💧 Weekly water usage report: Total 2,450 liters consumed.'},
        ]
        for i, ad in enumerate(alerts_data):
            alert = Alert(
                user_id=user.id,
                type=ad['type'],
                severity=ad['severity'],
                message=ad['message'],
                is_read=i >= 3,
                created_at=datetime.utcnow() - timedelta(hours=i * 6)
            )
            db.session.add(alert)
        db.session.commit()

        print('\n Seed data created successfully!')
        print(f'   User: farmer / farmer123')
        print(f'   Wells: {len(wells_data)}')
        print(f'   Valves: {len(valves_data)}')
        print(f'   Pipelines: {len(pipelines_data)}')
        print(f'   Alerts: {len(alerts_data)}')

if __name__ == '__main__':
    seed()
