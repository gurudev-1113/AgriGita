from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

# Temporary in-memory store for orders (can be moved to DB)
orders_db = []

@orders_bp.route('/place', methods=['POST'])
@jwt_required()
def place_order():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Requirement: Product, GPS Location, and Confirmation
    product = data.get('product')
    lat = data.get('latitude')
    lng = data.get('longitude')
    price = data.get('price')
    
    if not all([product, lat, lng]):
        return jsonify({'error': 'Product and GPS location are required.'}), 400
    
    order = {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'product': product,
        'price': price,
        'location': {'lat': lat, 'lng': lng},
        'status': 'Confirmed and Dispatched 🚚',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    orders_db.append(order)
    
    return jsonify({
        'success': True,
        'message': f'Order for {product} placed successfully!',
        'delivery_location': f'GPS Coordinates: {lat}, {lng}',
        'order_id': order['id']
    }), 201

@orders_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    user_orders = [o for o in orders_db if o['user_id'] == user_id]
    return jsonify(user_orders)
