import json
import os
from datetime import datetime, timedelta
from sqlalchemy import func

class ModelTrainer:
    def __init__(self, app, db):
        self.app = app
        self.db = db
        self.weights_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'model_weights.json')

    def run(self):
        with self.app.app_context():
            from backend.models.valve import Valve
            from backend.models.water_log import WaterLog
            
            print("🚀 Starting AI Model Training...")
            
            # 1. Analyze Irrigation Efficiency (Volume per hour)
            efficiency_weights = {}
            valves = Valve.query.all()
            for valve in valves:
                logs = WaterLog.query.filter_by(valve_id=valve.id).all()
                if logs:
                    avg_volume = sum(l.volume for l in logs) / len(logs)
                    efficiency_weights[str(valve.id)] = round(avg_volume, 2)
                else:
                    efficiency_weights[str(valve.id)] = 0.0

            # 2. Risk Assessment (Failure Probability based on health)
            # This is a mock logistic regression parameter
            risk_params = {
                'good': 0.02,
                'warning': 0.15,
                'damaged': 0.95
            }

            # 3. Usage Patterns (Daily Average)
            total_vol = self.db.session.query(func.sum(WaterLog.volume)).scalar() or 0.0
            earliest_log = self.db.session.query(func.min(WaterLog.timestamp)).scalar()
            if earliest_log:
                days = (datetime.utcnow() - earliest_log).days + 1
                daily_avg = round(total_vol / days, 2)
            else:
                daily_avg = 0.0

            model_data = {
                'trained_at': datetime.utcnow().isoformat(),
                'efficiency_weights': efficiency_weights,
                'risk_params': risk_params,
                'daily_avg_usage': daily_avg,
                'total_trained_on': len(valves),
                'status': 'optimized'
            }

            with open(self.weights_path, 'w') as f:
                json.dump(model_data, f, indent=2)
            
            print(f"✅ Training Complete. Model saved to {self.weights_path}")
            return model_data

    def load_weights(self):
        if os.path.exists(self.weights_path):
            with open(self.weights_path, 'r') as f:
                return json.load(f)
        return None
